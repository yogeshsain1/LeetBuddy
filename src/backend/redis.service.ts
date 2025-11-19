import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB', 0),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Redis error: ${error.message}`);
    });
  }

  // ==================== User Presence ====================

  async setUserPresence(
    userId: string,
    data: {
      status: 'online' | 'offline' | 'away' | 'busy';
      socketId: string | null;
      lastSeen: string;
    },
  ): Promise<void> {
    const key = `presence:${userId}`;
    await this.redis.hmset(key, {
      status: data.status,
      socketId: data.socketId || '',
      lastSeen: data.lastSeen,
      updatedAt: new Date().toISOString(),
    });
  }

  async getUserPresence(userId: string): Promise<any> {
    const key = `presence:${userId}`;
    const data = await this.redis.hgetall(key);
    if (!data || !data.status) return null;
    return {
      status: data.status,
      socketId: data.socketId || null,
      lastSeen: data.lastSeen,
      updatedAt: data.updatedAt,
    };
  }

  async getUserSocketId(userId: string): Promise<string | null> {
    const key = `presence:${userId}`;
    const socketId = await this.redis.hget(key, 'socketId');
    return socketId || null;
  }

  async getOnlineUsers(userIds: string[]): Promise<string[]> {
    const pipeline = this.redis.pipeline();
    userIds.forEach((userId) => {
      pipeline.hget(`presence:${userId}`, 'status');
    });

    const results = await pipeline.exec();
    const onlineUsers: string[] = [];

    results?.forEach((result, index) => {
      if (result[1] === 'online') {
        onlineUsers.push(userIds[index]);
      }
    });

    return onlineUsers;
  }

  // ==================== Message Caching ====================

  async cacheMessage(roomId: string, message: any): Promise<void> {
    const key = `room:${roomId}:messages`;
    const score = new Date(message.createdAt).getTime();
    
    await this.redis.zadd(key, score, JSON.stringify(message));
    await this.redis.expire(key, 86400); // 24 hours TTL
  }

  async cacheMessages(roomId: string, messages: any[]): Promise<void> {
    if (messages.length === 0) return;

    const key = `room:${roomId}:messages`;
    const pipeline = this.redis.pipeline();

    messages.forEach((message) => {
      const score = new Date(message.createdAt).getTime();
      pipeline.zadd(key, score, JSON.stringify(message));
    });

    pipeline.expire(key, 86400); // 24 hours TTL
    await pipeline.exec();
  }

  async getCachedMessages(
    roomId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<any[]> {
    const key = `room:${roomId}:messages`;
    const max = cursor ? new Date(cursor).getTime() : '+inf';
    
    const messages = await this.redis.zrevrangebyscore(
      key,
      max,
      '-inf',
      'LIMIT',
      0,
      limit,
    );

    return messages.map((msg) => JSON.parse(msg));
  }

  async invalidateMessageCache(roomId: string): Promise<void> {
    const key = `room:${roomId}:messages`;
    await this.redis.del(key);
  }

  // ==================== Typing Indicators ====================

  async addTypingUser(roomId: string, userId: string, ttl: number = 5): Promise<void> {
    const key = `typing:${roomId}`;
    await this.redis.sadd(key, userId);
    await this.redis.expire(key, ttl);
  }

  async removeTypingUser(roomId: string, userId: string): Promise<void> {
    const key = `typing:${roomId}`;
    await this.redis.srem(key, userId);
  }

  async getTypingUsers(roomId: string): Promise<string[]> {
    const key = `typing:${roomId}`;
    return await this.redis.smembers(key);
  }

  async clearUserTyping(userId: string): Promise<void> {
    // Find all typing keys and remove user
    const pattern = 'typing:*';
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      const pipeline = this.redis.pipeline();
      keys.forEach((key) => {
        pipeline.srem(key, userId);
      });
      await pipeline.exec();
    }
  }

  // ==================== Unread Count ====================

  async incrementUnreadCount(userId: string, roomId: string): Promise<number> {
    const key = `unread:${userId}`;
    const count = await this.redis.hincrby(key, roomId, 1);
    return count;
  }

  async resetUnreadCount(userId: string, roomId: string): Promise<void> {
    const key = `unread:${userId}`;
    await this.redis.hset(key, roomId, 0);
  }

  async getUnreadCount(userId: string, roomId?: string): Promise<number | Record<string, number>> {
    const key = `unread:${userId}`;
    
    if (roomId) {
      const count = await this.redis.hget(key, roomId);
      return parseInt(count || '0', 10);
    }

    const allCounts = await this.redis.hgetall(key);
    const result: Record<string, number> = {};
    
    Object.entries(allCounts).forEach(([room, count]) => {
      result[room] = parseInt(count, 10);
    });

    return result;
  }

  // ==================== Rate Limiting ====================

  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    const rateLimitKey = `ratelimit:${key}`;
    const current = await this.redis.incr(rateLimitKey);

    if (current === 1) {
      await this.redis.expire(rateLimitKey, windowSeconds);
    }

    if (current > limit) {
      const ttl = await this.redis.ttl(rateLimitKey);
      this.logger.warn(`Rate limit exceeded for ${key}. Retry in ${ttl}s`);
      return false;
    }

    return true;
  }

  async slidingWindowRateLimit(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    const rateLimitKey = `ratelimit:sliding:${key}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old entries
    await this.redis.zremrangebyscore(rateLimitKey, 0, windowStart);

    // Count recent requests
    const count = await this.redis.zcard(rateLimitKey);

    if (count >= limit) {
      this.logger.warn(`Sliding window rate limit exceeded for ${key}`);
      return false;
    }

    // Add new request
    await this.redis.zadd(rateLimitKey, now, `${now}-${Math.random()}`);
    await this.redis.expire(rateLimitKey, Math.ceil(windowMs / 1000));

    return true;
  }

  // ==================== Room Members Cache ====================

  async cacheRoomMembers(roomId: string, memberIds: string[]): Promise<void> {
    const key = `room:${roomId}:members`;
    if (memberIds.length > 0) {
      await this.redis.sadd(key, ...memberIds);
      await this.redis.expire(key, 3600); // 1 hour TTL
    }
  }

  async getRoomMembers(roomId: string): Promise<string[]> {
    const key = `room:${roomId}:members`;
    return await this.redis.smembers(key);
  }

  async isRoomMember(roomId: string, userId: string): Promise<boolean> {
    const key = `room:${roomId}:members`;
    const isMember = await this.redis.sismember(key, userId);
    return isMember === 1;
  }

  // ==================== Last Seen Cache ====================

  async updateLastSeen(userId: string): Promise<void> {
    const key = `lastseen:${userId}`;
    await this.redis.set(key, new Date().toISOString(), 'EX', 86400);
  }

  async getLastSeen(userId: string): Promise<string | null> {
    const key = `lastseen:${userId}`;
    return await this.redis.get(key);
  }

  async getBatchLastSeen(userIds: string[]): Promise<Record<string, string>> {
    const pipeline = this.redis.pipeline();
    userIds.forEach((userId) => {
      pipeline.get(`lastseen:${userId}`);
    });

    const results = await pipeline.exec();
    const lastSeenMap: Record<string, string> = {};

    results?.forEach((result, index) => {
      if (result[1]) {
        lastSeenMap[userIds[index]] = result[1] as string;
      }
    });

    return lastSeenMap;
  }

  // ==================== Pub/Sub for Multi-Server Scaling ====================

  async publishMessage(channel: string, message: any): Promise<void> {
    await this.redis.publish(channel, JSON.stringify(message));
  }

  subscribeToChannel(channel: string, callback: (message: any) => void): void {
    const subscriber = this.redis.duplicate();
    
    subscriber.subscribe(channel, (err) => {
      if (err) {
        this.logger.error(`Failed to subscribe to ${channel}: ${err.message}`);
      } else {
        this.logger.log(`Subscribed to channel: ${channel}`);
      }
    });

    subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(msg);
          callback(parsed);
        } catch (error) {
          this.logger.error(`Failed to parse message from ${channel}: ${error.message}`);
        }
      }
    });
  }

  // ==================== Utility ====================

  async ping(): Promise<string> {
    return await this.redis.ping();
  }

  async flushAll(): Promise<void> {
    await this.redis.flushall();
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}

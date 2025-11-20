import Redis from 'ioredis';

// Redis client singleton
let redisClient: Redis | null = null;
let redisEnabled = true;

export function getRedisClient(): Redis | null {
  if (!redisEnabled) return null;
  
  if (!redisClient) {
    try {
      redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('⚠️ Redis unavailable - running without cache');
            redisEnabled = false;
            return null;
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        redisEnabled = false;
      });

      redisClient.on('connect', () => {
        console.log('✓ Redis Connected');
        redisEnabled = true;
      });

      // Try to connect
      redisClient.connect().catch(() => {
        console.warn('⚠️ Redis unavailable - running without cache');
        redisEnabled = false;
      });
    } catch (err) {
      console.error('Redis initialization error:', err);
      redisEnabled = false;
      return null;
    }
  }

  return redisClient;
}

// ==================== PRESENCE TRACKING ====================

export async function setUserOnline(userId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `user:${userId}:online`;
  
  await redis.set(key, '1', 'EX', 300); // Expire after 5 minutes
  await redis.publish('user:presence', JSON.stringify({ userId, status: 'online' }));
}

export async function setUserOffline(userId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `user:${userId}:online`;
  
  await redis.del(key);
  await redis.publish('user:presence', JSON.stringify({ userId, status: 'offline' }));
}

export async function isUserOnline(userId: number): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;
  const key = `user:${userId}:online`;
  
  const result = await redis.get(key);
  return result === '1';
}

export async function getOnlineUsers(userIds: number[]): Promise<number[]> {
  if (userIds.length === 0) return [];
  
  const redis = getRedisClient();
  if (!redis) return [];
  const pipeline = redis.pipeline();
  
  userIds.forEach((userId) => {
    pipeline.get(`user:${userId}:online`);
  });
  
  const results = await pipeline.exec();
  
  return userIds.filter((_, index) => {
    const result = results?.[index];
    return result && result[1] === '1';
  });
}

// ==================== TYPING INDICATORS ====================

export async function setUserTyping(roomId: number, userId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `room:${roomId}:typing`;
  
  await redis.sadd(key, userId.toString());
  await redis.expire(key, 10); // Auto-expire after 10 seconds
  await redis.publish('room:typing', JSON.stringify({ roomId, userId, isTyping: true }));
}

export async function removeUserTyping(roomId: number, userId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `room:${roomId}:typing`;
  
  await redis.srem(key, userId.toString());
  await redis.publish('room:typing', JSON.stringify({ roomId, userId, isTyping: false }));
}

export async function getTypingUsers(roomId: number): Promise<number[]> {
  const redis = getRedisClient();
  if (!redis) return [];
  const key = `room:${roomId}:typing`;
  
  const members = await redis.smembers(key);
  return members.map((id) => parseInt(id));
}

// ==================== MESSAGE CACHING ====================

export async function cacheMessage(roomId: number, message: any): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `room:${roomId}:messages`;
  
  await redis.zadd(key, Date.now(), JSON.stringify(message));
  await redis.expire(key, 3600); // Cache for 1 hour
  
  // Keep only last 100 messages in cache
  await redis.zremrangebyrank(key, 0, -101);
}

export async function getCachedMessages(roomId: number, limit = 50): Promise<any[]> {
  const redis = getRedisClient();
  if (!redis) return [];
  const key = `room:${roomId}:messages`;
  
  const messages = await redis.zrevrange(key, 0, limit - 1);
  return messages.map((msg) => JSON.parse(msg));
}

// ==================== UNREAD COUNTS ====================

export async function incrementUnreadCount(userId: string, roomId: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `user:${userId}:unread`;
  
  await redis.hincrby(key, roomId.toString(), 1);
}

export async function resetUnreadCount(userId: string, roomId: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `user:${userId}:unread`;
  
  await redis.hdel(key, roomId.toString());
}

export async function getUnreadCounts(userId: string): Promise<Record<number, number>> {
  const redis = getRedisClient();
  if (!redis) return {};
  const key = `user:${userId}:unread`;
  
  const counts = await redis.hgetall(key);
  const result: Record<number, number> = {};
  
  for (const [roomId, count] of Object.entries(counts)) {
    result[parseInt(roomId)] = parseInt(count);
  }
  
  return result;
}

// ==================== RATE LIMITING ====================

export async function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return true; // Allow if Redis unavailable
  const key = `ratelimit:${action}:${userId}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  return current <= maxRequests;
}

// ==================== SESSION MANAGEMENT ====================

export async function storeSocketSession(userId: string, socketId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `user:${userId}:sockets`;
  
  await redis.sadd(key, socketId);
  await redis.expire(key, 86400); // 24 hours
}

export async function removeSocketSession(userId: string, socketId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const key = `user:${userId}:sockets`;
  
  await redis.srem(key, socketId);
}

export async function getUserSockets(userId: number): Promise<string[]> {
  const redis = getRedisClient();
  if (!redis) return [];
  const key = `user:${userId}:sockets`;
  
  return await redis.smembers(key);
}

// ==================== CLEANUP ====================

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

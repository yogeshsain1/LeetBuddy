import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './redis.service';
import { ChatService } from './chat.service';

interface SocketData {
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface AuthSocket extends Socket {
  data: SocketData;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    
    // Authentication middleware
    server.use(async (socket: AuthSocket, next) => {
      try {
        const token = socket.handshake.auth.token || 
                     socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = await this.jwtService.verifyAsync(token);
        
        socket.data.userId = decoded.userId;
        socket.data.userName = decoded.userName;
        socket.data.userAvatar = decoded.userAvatar;
        
        next();
      } catch (error) {
        this.logger.error(`Authentication failed: ${error.message}`);
        next(new Error('Invalid token'));
      }
    });
  }

  async handleConnection(client: AuthSocket) {
    try {
      const { userId, userName } = client.data;
      this.logger.log(`Client connected: ${userId} (${client.id})`);

      // Update presence to online
      await this.redisService.setUserPresence(userId, {
        status: 'online',
        socketId: client.id,
        lastSeen: new Date().toISOString(),
      });

      // Join user to their rooms
      const rooms = await this.chatService.getUserRooms(userId);
      for (const room of rooms) {
        await client.join(room.id);
      }

      // Broadcast online status to user's contacts
      const contacts = await this.chatService.getUserContacts(userId);
      for (const contact of contacts) {
        this.server.to(contact.socketId).emit('presence.online', {
          userId,
          userName,
          status: 'online',
          timestamp: new Date().toISOString(),
        });
      }

      // Send pending messages/notifications
      const pending = await this.chatService.getPendingMessages(userId);
      if (pending.length > 0) {
        client.emit('messages.pending', pending);
      }

      // Acknowledge connection
      client.emit('connection.authenticated', {
        userId,
        rooms: rooms.map(r => r.id),
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthSocket) {
    try {
      const { userId, userName } = client.data;
      this.logger.log(`Client disconnected: ${userId} (${client.id})`);

      // Update presence to offline
      await this.redisService.setUserPresence(userId, {
        status: 'offline',
        socketId: null,
        lastSeen: new Date().toISOString(),
      });

      // Clear typing indicators
      await this.redisService.clearUserTyping(userId);

      // Broadcast offline status
      const contacts = await this.chatService.getUserContacts(userId);
      for (const contact of contacts) {
        this.server.to(contact.socketId).emit('presence.offline', {
          userId,
          userName,
          status: 'offline',
          lastSeen: new Date().toISOString(),
        });
      }

    } catch (error) {
      this.logger.error(`Disconnection error: ${error.message}`);
    }
  }

  @SubscribeMessage('message.send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: {
      roomId: string;
      content: string;
      type: 'text' | 'image' | 'file' | 'audio' | 'video';
      replyToId?: string;
      metadata?: any;
      tempId: string;
    },
  ) {
    try {
      const { userId, userName, userAvatar } = client.data;

      // Rate limiting check
      const rateLimitOk = await this.redisService.checkRateLimit(
        `message:${userId}`,
        10, // 10 messages
        60, // per 60 seconds
      );

      if (!rateLimitOk) {
        return {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many messages. Please slow down.',
          tempId: data.tempId,
        };
      }

      // Validate room membership
      const isMember = await this.chatService.isRoomMember(data.roomId, userId);
      if (!isMember) {
        return { error: 'NOT_A_MEMBER', tempId: data.tempId };
      }

      // Create message
      const message = await this.chatService.createMessage({
        roomId: data.roomId,
        senderId: userId,
        content: data.content,
        type: data.type,
        replyToId: data.replyToId,
        metadata: data.metadata,
      });

      // Cache message in Redis
      await this.redisService.cacheMessage(data.roomId, message);

      // Broadcast to room
      this.server.to(data.roomId).emit('message.received', {
        messageId: message.id,
        roomId: message.roomId,
        senderId: userId,
        senderName: userName,
        senderAvatar: userAvatar,
        content: message.content,
        type: message.type,
        replyTo: data.replyToId ? await this.chatService.getMessageById(data.replyToId) : undefined,
        metadata: message.metadata,
        timestamp: message.createdAt,
      });

      // Return acknowledgment
      return {
        tempId: data.tempId,
        messageId: message.id,
        roomId: message.roomId,
        timestamp: message.createdAt,
        status: 'sent',
      };

    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      return { 
        error: 'SEND_FAILED', 
        message: error.message,
        tempId: data.tempId,
      };
    }
  }

  @SubscribeMessage('message.edit')
  async handleEditMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { messageId: string; content: string; roomId: string },
  ) {
    try {
      const { userId } = client.data;

      // Verify message ownership
      const message = await this.chatService.getMessageById(data.messageId);
      if (message.senderId !== userId) {
        return { error: 'UNAUTHORIZED' };
      }

      // Update message
      const updated = await this.chatService.editMessage(data.messageId, data.content);

      // Invalidate cache
      await this.redisService.invalidateMessageCache(data.roomId);

      // Broadcast to room
      this.server.to(data.roomId).emit('message.edited', {
        messageId: data.messageId,
        roomId: data.roomId,
        content: updated.content,
        editedAt: updated.editedAt,
      });

      return { success: true, editedAt: updated.editedAt };

    } catch (error) {
      this.logger.error(`Edit message error: ${error.message}`);
      return { error: 'EDIT_FAILED', message: error.message };
    }
  }

  @SubscribeMessage('message.delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { messageId: string; roomId: string },
  ) {
    try {
      const { userId } = client.data;

      // Verify message ownership
      const message = await this.chatService.getMessageById(data.messageId);
      if (message.senderId !== userId) {
        return { error: 'UNAUTHORIZED' };
      }

      // Soft delete message
      await this.chatService.deleteMessage(data.messageId);

      // Invalidate cache
      await this.redisService.invalidateMessageCache(data.roomId);

      // Broadcast to room
      this.server.to(data.roomId).emit('message.deleted', {
        messageId: data.messageId,
        roomId: data.roomId,
        deletedAt: new Date().toISOString(),
      });

      return { success: true };

    } catch (error) {
      this.logger.error(`Delete message error: ${error.message}`);
      return { error: 'DELETE_FAILED', message: error.message };
    }
  }

  @SubscribeMessage('message.read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { messageIds: string[]; roomId: string },
  ) {
    try {
      const { userId } = client.data;

      // Update message status
      await this.chatService.markMessagesAsRead(data.messageIds, userId);

      // Update member's last read
      await this.chatService.updateLastRead(data.roomId, userId, data.messageIds[data.messageIds.length - 1]);

      // Broadcast read receipts to room
      this.server.to(data.roomId).emit('message.read.receipt', {
        userId,
        messageIds: data.messageIds,
        roomId: data.roomId,
        readAt: new Date().toISOString(),
      });

      return { success: true };

    } catch (error) {
      this.logger.error(`Mark as read error: ${error.message}`);
      return { error: 'READ_FAILED', message: error.message };
    }
  }

  @SubscribeMessage('typing.start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const { userId, userName } = client.data;

      // Rate limit typing events
      const rateLimitOk = await this.redisService.checkRateLimit(
        `typing:${userId}`,
        30, // 30 events
        60, // per 60 seconds
      );

      if (!rateLimitOk) return;

      // Add to typing set in Redis
      await this.redisService.addTypingUser(data.roomId, userId, 5); // 5 second TTL

      // Broadcast to room (except sender)
      client.to(data.roomId).emit('typing.user', {
        roomId: data.roomId,
        userId,
        userName,
        isTyping: true,
      });

    } catch (error) {
      this.logger.error(`Typing start error: ${error.message}`);
    }
  }

  @SubscribeMessage('typing.stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const { userId, userName } = client.data;

      // Remove from typing set
      await this.redisService.removeTypingUser(data.roomId, userId);

      // Broadcast to room
      client.to(data.roomId).emit('typing.user', {
        roomId: data.roomId,
        userId,
        userName,
        isTyping: false,
      });

    } catch (error) {
      this.logger.error(`Typing stop error: ${error.message}`);
    }
  }

  @SubscribeMessage('message.history')
  async handleGetHistory(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: {
      roomId: string;
      cursor?: string;
      limit?: number;
      direction?: 'before' | 'after';
    },
  ) {
    try {
      const { userId } = client.data;

      // Verify room membership
      const isMember = await this.chatService.isRoomMember(data.roomId, userId);
      if (!isMember) {
        return { error: 'NOT_A_MEMBER' };
      }

      // Check cache first
      const cached = await this.redisService.getCachedMessages(
        data.roomId,
        data.cursor,
        data.limit || 50,
      );

      if (cached && cached.length >= (data.limit || 50)) {
        return {
          messages: cached,
          nextCursor: cached[cached.length - 1]?.createdAt,
          hasMore: true,
        };
      }

      // Fetch from database
      const result = await this.chatService.getMessageHistory({
        roomId: data.roomId,
        cursor: data.cursor,
        limit: data.limit || 50,
        direction: data.direction || 'before',
      });

      // Cache results
      if (result.messages.length > 0) {
        await this.redisService.cacheMessages(data.roomId, result.messages);
      }

      return result;

    } catch (error) {
      this.logger.error(`Get history error: ${error.message}`);
      return { error: 'HISTORY_FAILED', message: error.message };
    }
  }

  @SubscribeMessage('room.create')
  async handleCreateRoom(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: {
      type: 'direct' | 'group';
      name?: string;
      memberIds: string[];
      description?: string;
      isPrivate?: boolean;
    },
  ) {
    try {
      const { userId } = client.data;

      // Rate limit room creation
      const rateLimitOk = await this.redisService.checkRateLimit(
        `room:create:${userId}`,
        3, // 3 rooms
        3600, // per hour
      );

      if (!rateLimitOk) {
        return { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many rooms created' };
      }

      // Create room
      const room = await this.chatService.createRoom({
        type: data.type,
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate || false,
        createdBy: userId,
        memberIds: [...data.memberIds, userId],
      });

      // Join all online members to Socket.IO room
      for (const memberId of room.memberIds) {
        const memberSocket = await this.redisService.getUserSocketId(memberId);
        if (memberSocket) {
          this.server.to(memberSocket).socketsJoin(room.id);
          this.server.to(memberSocket).emit('room.created', room);
        }
      }

      return { success: true, room };

    } catch (error) {
      this.logger.error(`Create room error: ${error.message}`);
      return { error: 'CREATE_ROOM_FAILED', message: error.message };
    }
  }

  @SubscribeMessage('presence.status.update')
  async handleUpdateStatus(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { status: 'online' | 'away' | 'busy' },
  ) {
    try {
      const { userId, userName } = client.data;

      await this.redisService.setUserPresence(userId, {
        status: data.status,
        socketId: client.id,
        lastSeen: new Date().toISOString(),
      });

      // Broadcast to contacts
      const contacts = await this.chatService.getUserContacts(userId);
      for (const contact of contacts) {
        this.server.to(contact.socketId).emit('presence.status.update', {
          userId,
          userName,
          status: data.status,
          timestamp: new Date().toISOString(),
        });
      }

      return { success: true };

    } catch (error) {
      this.logger.error(`Update status error: ${error.message}`);
      return { error: 'STATUS_UPDATE_FAILED', message: error.message };
    }
  }
}

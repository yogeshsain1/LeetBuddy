import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  setUserOnline,
  setUserOffline,
  setUserTyping,
  removeUserTyping,
  storeSocketSession,
  removeSocketSession,
  checkRateLimit,
  resetUnreadCount,
} from '@/lib/redis';
import {
  createMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead,
  type SendMessageData,
} from './services/message.service';

// ==================== TYPES ====================

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

interface ClientToServerEvents {
  // Authentication
  authenticate: (token: string) => void;

  // Messages
  send_message: (data: SendMessageData, callback: (response: any) => void) => void;
  edit_message: (data: { messageId: number; content: string }, callback: (response: any) => void) => void;
  delete_message: (messageId: number, callback: (response: any) => void) => void;
  mark_as_read: (data: { roomId: number; messageId: number }) => void;

  // Typing
  typing_start: (roomId: number) => void;
  typing_stop: (roomId: number) => void;

  // Rooms
  join_room: (roomId: number) => void;
  leave_room: (roomId: number) => void;

  // Reactions
  add_reaction: (data: { messageId: number; emoji: string }, callback: (response: any) => void) => void;
  remove_reaction: (data: { messageId: number; emoji: string }, callback: (response: any) => void) => void;

  // Presence
  update_status: (status: 'online' | 'away' | 'busy') => void;
}

interface ServerToClientEvents {
  // Messages
  new_message: (message: any) => void;
  message_edited: (data: { messageId: number; content: string }) => void;
  message_deleted: (messageId: number) => void;
  messages_read: (data: { roomId: number; userId: string; messageId: number }) => void;

  // Typing
  user_typing: (data: { roomId: number; userId: string; username: string }) => void;
  user_stopped_typing: (data: { roomId: number; userId: string }) => void;

  // Presence
  user_online: (userId: string) => void;
  user_offline: (userId: string) => void;
  user_status_changed: (data: { userId: string; status: string }) => void;

  // Reactions
  reaction_added: (data: { messageId: number; userId: string; emoji: string }) => void;
  reaction_removed: (data: { messageId: number; userId: string; emoji: string }) => void;

  // Notifications
  new_notification: (notification: any) => void;

  // Errors
  error: (error: { code: string; message: string }) => void;
}

// ==================== SOCKET.IO SERVER ====================

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ==================== AUTHENTICATION ====================

    socket.on('authenticate', async (token: string) => {
      try {
        // TODO: Implement proper JWT verification
        // For now, we'll use a simple mock authentication
        const userId = token; // In real app, verify JWT and extract userId (should be string UUID)
        
        if (!userId) {
          socket.emit('error', { code: 'AUTH_FAILED', message: 'Authentication failed' });
          socket.disconnect();
          return;
        }

        socket.userId = userId;
        socket.username = `User${userId}`; // In real app, fetch from database

        // Store socket session
        await storeSocketSession(userId, socket.id);

        // Set user online
        await setUserOnline(userId);

        // Notify others
        socket.broadcast.emit('user_online', userId);

        console.log(`✅ User authenticated: ${userId} (${socket.id})`);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', { code: 'AUTH_ERROR', message: 'Authentication error' });
        socket.disconnect();
      }
    });

    // ==================== ROOM MANAGEMENT ====================

    socket.on('join_room', async (roomId: number) => {
      if (!socket.userId) {
        socket.emit('error', { code: 'NOT_AUTHENTICATED', message: 'Not authenticated' });
        return;
      }

      try {
        const roomName = `room:${roomId}`;
        await socket.join(roomName);
        
        // Reset unread count
        await resetUnreadCount(socket.userId, roomId);

        console.log(`👥 User ${socket.userId} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { code: 'JOIN_ROOM_ERROR', message: 'Could not join room' });
      }
    });

    socket.on('leave_room', async (roomId: number) => {
      if (!socket.userId) return;

      try {
        const roomName = `room:${roomId}`;
        await socket.leave(roomName);
        
        // Stop typing indicator
        await removeUserTyping(roomId, socket.userId);

        console.log(`👋 User ${socket.userId} left room ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // ==================== MESSAGING ====================

    socket.on('send_message', async (data: SendMessageData, callback) => {
      if (!socket.userId) {
        callback({ success: false, error: 'Not authenticated' });
        return;
      }

      try {
        // Rate limiting: 20 messages per minute
        const canSend = await checkRateLimit(socket.userId, 'send_message', 20, 60);
        if (!canSend) {
          callback({ success: false, error: 'Rate limit exceeded' });
          return;
        }

        // Create message
        const message = await createMessage({
          ...data,
          senderId: socket.userId,
        });

        if (!message) {
          callback({ success: false, error: 'Failed to create message' });
          return;
        }

        // Remove typing indicator
        await removeUserTyping(data.roomId, socket.userId);
        io?.to(`room:${data.roomId}`).emit('user_stopped_typing', {
          roomId: data.roomId,
          userId: socket.userId,
        });

        // Broadcast to room
        io?.to(`room:${data.roomId}`).emit('new_message', message);

        callback({ success: true, message });

        console.log(`✉️ Message sent in room ${data.roomId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ success: false, error: 'Server error' });
      }
    });

    socket.on('edit_message', async (data, callback) => {
      if (!socket.userId) {
        callback({ success: false, error: 'Not authenticated' });
        return;
      }

      try {
        const success = await editMessage(data.messageId, socket.userId, data.content);

        if (success) {
          // Get the room for this message
          // TODO: Query database for roomId
          const roomId = 1; // Placeholder

          io?.to(`room:${roomId}`).emit('message_edited', {
            messageId: data.messageId,
            content: data.content,
          });

          callback({ success: true });
        } else {
          callback({ success: false, error: 'Failed to edit message' });
        }
      } catch (error) {
        console.error('Error editing message:', error);
        callback({ success: false, error: 'Server error' });
      }
    });

    socket.on('delete_message', async (messageId, callback) => {
      if (!socket.userId) {
        callback({ success: false, error: 'Not authenticated' });
        return;
      }

      try {
        const success = await deleteMessage(messageId, socket.userId);

        if (success) {
          // Get the room for this message
          // TODO: Query database for roomId
          const roomId = 1; // Placeholder

          io?.to(`room:${roomId}`).emit('message_deleted', messageId);

          callback({ success: true });
        } else {
          callback({ success: false, error: 'Failed to delete message' });
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        callback({ success: false, error: 'Server error' });
      }
    });

    socket.on('mark_as_read', async (data) => {
      if (!socket.userId) return;

      try {
        await markAsRead(data.messageId, socket.userId);
        await resetUnreadCount(socket.userId, data.roomId);

        io?.to(`room:${data.roomId}`).emit('messages_read', {
          roomId: data.roomId,
          userId: socket.userId,
          messageId: data.messageId,
        });
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    });

    // ==================== TYPING INDICATORS ====================

    socket.on('typing_start', async (roomId: number) => {
      if (!socket.userId || !socket.username) return;

      try {
        await setUserTyping(roomId, socket.userId);

        socket.to(`room:${roomId}`).emit('user_typing', {
          roomId,
          userId: socket.userId,
          username: socket.username,
        });
      } catch (error) {
        console.error('Error setting typing:', error);
      }
    });

    socket.on('typing_stop', async (roomId: number) => {
      if (!socket.userId) return;

      try {
        await removeUserTyping(roomId, socket.userId);

        socket.to(`room:${roomId}`).emit('user_stopped_typing', {
          roomId,
          userId: socket.userId,
        });
      } catch (error) {
        console.error('Error removing typing:', error);
      }
    });

    // ==================== REACTIONS ====================

    socket.on('add_reaction', async (data, callback) => {
      if (!socket.userId) {
        callback({ success: false, error: 'Not authenticated' });
        return;
      }

      try {
        const success = await addReaction(data.messageId, socket.userId, data.emoji);

        if (success) {
          // Get the room for this message
          // TODO: Query database for roomId
          const roomId = 1; // Placeholder

          io?.to(`room:${roomId}`).emit('reaction_added', {
            messageId: data.messageId,
            userId: socket.userId,
            emoji: data.emoji,
          });

          callback({ success: true });
        } else {
          callback({ success: false, error: 'Failed to add reaction' });
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
        callback({ success: false, error: 'Server error' });
      }
    });

    socket.on('remove_reaction', async (data, callback) => {
      if (!socket.userId) {
        callback({ success: false, error: 'Not authenticated' });
        return;
      }

      try {
        const success = await removeReaction(data.messageId, socket.userId, data.emoji);

        if (success) {
          // Get the room for this message
          // TODO: Query database for roomId
          const roomId = 1; // Placeholder

          io?.to(`room:${roomId}`).emit('reaction_removed', {
            messageId: data.messageId,
            userId: socket.userId,
            emoji: data.emoji,
          });

          callback({ success: true });
        } else {
          callback({ success: false, error: 'Failed to remove reaction' });
        }
      } catch (error) {
        console.error('Error removing reaction:', error);
        callback({ success: false, error: 'Server error' });
      }
    });

    // ==================== PRESENCE ====================

    socket.on('update_status', async (status) => {
      if (!socket.userId) return;

      try {
        // Update user status in database
        // TODO: Implement status update in database

        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          status,
        });
      } catch (error) {
        console.error('Error updating status:', error);
      }
    });

    // ==================== DISCONNECTION ====================

    socket.on('disconnect', async () => {
      if (socket.userId) {
        try {
          // Remove socket session
          await removeSocketSession(socket.userId, socket.id);

          // Set user offline
          await setUserOffline(socket.userId);

          // Notify others
          socket.broadcast.emit('user_offline', socket.userId);

          console.log(`🔌 User ${socket.userId} disconnected (${socket.id})`);
        } catch (error) {
          console.error('Error handling disconnection:', error);
        }
      }
    });
  });

  console.log('🚀 Socket.IO server initialized');
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function closeSocket(): void {
  if (io) {
    io.close();
    io = null;
    console.log('🔌 Socket.IO server closed');
  }
}

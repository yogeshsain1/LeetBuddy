'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// ==================== TYPES ====================

export interface Message {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  type: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  createdAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  reactions?: Array<{ emoji: string; count: number; users: number[] }>;
}

export interface TypingUser {
  userId: number;
  username: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<number>;
  typingUsers: Map<number, TypingUser[]>; // roomId -> typing users
  
  // Connection
  connect: (userId: number) => void;
  disconnect: () => void;
  
  // Rooms
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  
  // Messages
  sendMessage: (data: {
    roomId: number;
    content: string;
    type?: string;
    fileUrl?: string;
    fileName?: string;
  }) => Promise<{ success: boolean; message?: Message; error?: string }>;
  editMessage: (messageId: number, content: string) => Promise<{ success: boolean; error?: string }>;
  deleteMessage: (messageId: number) => Promise<{ success: boolean; error?: string }>;
  markAsRead: (roomId: number, messageId: number) => void;
  
  // Typing
  startTyping: (roomId: number) => void;
  stopTyping: (roomId: number) => void;
  
  // Reactions
  addReaction: (messageId: number, emoji: string) => Promise<{ success: boolean; error?: string }>;
  removeReaction: (messageId: number, emoji: string) => Promise<{ success: boolean; error?: string }>;
  
  // Event listeners
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onMessageEdited: (callback: (data: { messageId: number; content: string }) => void) => () => void;
  onMessageDeleted: (callback: (messageId: number) => void) => () => void;
  onUserOnline: (callback: (userId: number) => void) => () => void;
  onUserOffline: (callback: (userId: number) => void) => () => void;
  onReactionAdded: (callback: (data: { messageId: number; userId: number; emoji: string }) => void) => () => void;
  onReactionRemoved: (callback: (data: { messageId: number; userId: number; emoji: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

// ==================== PROVIDER ====================

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<number, TypingUser[]>>(new Map());
  
  const typingTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // ==================== CONNECTION ====================

  const connect = useCallback((userId: number) => {
    if (socket?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      
      // Authenticate
      newSocket.emit('authenticate', userId.toString());
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // User presence events
    newSocket.on('user_online', (userId: number) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    newSocket.on('user_offline', (userId: number) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // Typing events
    newSocket.on('user_typing', (data: { roomId: number; userId: number; username: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        const roomTyping = next.get(data.roomId) || [];
        
        // Add user if not already typing
        if (!roomTyping.some((u) => u.userId === data.userId)) {
          next.set(data.roomId, [...roomTyping, { userId: data.userId, username: data.username }]);
        }
        
        return next;
      });

      // Clear existing timeout
      const existingTimeout = typingTimeoutRef.current.get(data.roomId * 1000 + data.userId);
      if (existingTimeout) clearTimeout(existingTimeout);

      // Auto-remove after 5 seconds
      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          const roomTyping = next.get(data.roomId) || [];
          next.set(
            data.roomId,
            roomTyping.filter((u) => u.userId !== data.userId)
          );
          return next;
        });
      }, 5000);

      typingTimeoutRef.current.set(data.roomId * 1000 + data.userId, timeout);
    });

    newSocket.on('user_stopped_typing', (data: { roomId: number; userId: number }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        const roomTyping = next.get(data.roomId) || [];
        next.set(
          data.roomId,
          roomTyping.filter((u) => u.userId !== data.userId)
        );
        return next;
      });

      const timeout = typingTimeoutRef.current.get(data.roomId * 1000 + data.userId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutRef.current.delete(data.roomId * 1000 + data.userId);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // ==================== ROOMS ====================

  const joinRoom = useCallback(
    (roomId: number) => {
      if (!socket) return;
      socket.emit('join_room', roomId);
    },
    [socket]
  );

  const leaveRoom = useCallback(
    (roomId: number) => {
      if (!socket) return;
      socket.emit('leave_room', roomId);
    },
    [socket]
  );

  // ==================== MESSAGES ====================

  const sendMessage = useCallback(
    (data: {
      roomId: number;
      content: string;
      type?: string;
      fileUrl?: string;
      fileName?: string;
    }): Promise<{ success: boolean; message?: Message; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) {
          resolve({ success: false, error: 'Not connected' });
          return;
        }

        socket.emit('send_message', data, (response: any) => {
          resolve(response);
        });
      });
    },
    [socket]
  );

  const editMessage = useCallback(
    (messageId: number, content: string): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) {
          resolve({ success: false, error: 'Not connected' });
          return;
        }

        socket.emit('edit_message', { messageId, content }, (response: any) => {
          resolve(response);
        });
      });
    },
    [socket]
  );

  const deleteMessage = useCallback(
    (messageId: number): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) {
          resolve({ success: false, error: 'Not connected' });
          return;
        }

        socket.emit('delete_message', messageId, (response: any) => {
          resolve(response);
        });
      });
    },
    [socket]
  );

  const markAsRead = useCallback(
    (roomId: number, messageId: number) => {
      if (!socket) return;
      socket.emit('mark_as_read', { roomId, messageId });
    },
    [socket]
  );

  // ==================== TYPING ====================

  const startTyping = useCallback(
    (roomId: number) => {
      if (!socket) return;
      socket.emit('typing_start', roomId);
    },
    [socket]
  );

  const stopTyping = useCallback(
    (roomId: number) => {
      if (!socket) return;
      socket.emit('typing_stop', roomId);
    },
    [socket]
  );

  // ==================== REACTIONS ====================

  const addReaction = useCallback(
    (messageId: number, emoji: string): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) {
          resolve({ success: false, error: 'Not connected' });
          return;
        }

        socket.emit('add_reaction', { messageId, emoji }, (response: any) => {
          resolve(response);
        });
      });
    },
    [socket]
  );

  const removeReaction = useCallback(
    (messageId: number, emoji: string): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) {
          resolve({ success: false, error: 'Not connected' });
          return;
        }

        socket.emit('remove_reaction', { messageId, emoji }, (response: any) => {
          resolve(response);
        });
      });
    },
    [socket]
  );

  // ==================== EVENT LISTENERS ====================

  const onNewMessage = useCallback(
    (callback: (message: Message) => void) => {
      if (!socket) return () => {};
      socket.on('new_message', callback);
      return () => {
        socket.off('new_message', callback);
      };
    },
    [socket]
  );

  const onMessageEdited = useCallback(
    (callback: (data: { messageId: number; content: string }) => void) => {
      if (!socket) return () => {};
      socket.on('message_edited', callback);
      return () => {
        socket.off('message_edited', callback);
      };
    },
    [socket]
  );

  const onMessageDeleted = useCallback(
    (callback: (messageId: number) => void) => {
      if (!socket) return () => {};
      socket.on('message_deleted', callback);
      return () => {
        socket.off('message_deleted', callback);
      };
    },
    [socket]
  );

  const onUserOnline = useCallback(
    (callback: (userId: number) => void) => {
      if (!socket) return () => {};
      socket.on('user_online', callback);
      return () => {
        socket.off('user_online', callback);
      };
    },
    [socket]
  );

  const onUserOffline = useCallback(
    (callback: (userId: number) => void) => {
      if (!socket) return () => {};
      socket.on('user_offline', callback);
      return () => {
        socket.off('user_offline', callback);
      };
    },
    [socket]
  );

  const onReactionAdded = useCallback(
    (callback: (data: { messageId: number; userId: number; emoji: string }) => void) => {
      if (!socket) return () => {};
      socket.on('reaction_added', callback);
      return () => {
        socket.off('reaction_added', callback);
      };
    },
    [socket]
  );

  const onReactionRemoved = useCallback(
    (callback: (data: { messageId: number; userId: number; emoji: string }) => void) => {
      if (!socket) return () => {};
      socket.on('reaction_removed', callback);
      return () => {
        socket.off('reaction_removed', callback);
      };
    },
    [socket]
  );

  // ==================== CLEANUP ====================

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
      // Clear all typing timeouts
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
    onNewMessage,
    onMessageEdited,
    onMessageDeleted,
    onUserOnline,
    onUserOffline,
    onReactionAdded,
    onReactionRemoved,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// ==================== HOOK ====================

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
interface Message {
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
  };
  metadata?: any;
  timestamp: string;
  editedAt?: string;
  tempId?: string;
}

interface TypingUser {
  userId: string;
  userName: string;
}

interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

// Socket.IO Hook
export function useSocket(token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });

    socketInstance.on('connection.authenticated', (data) => {
      console.log('Authenticated:', data);
    });

    socketInstance.on('connection.unauthorized', () => {
      console.error('Unauthorized connection');
      socketInstance.disconnect();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return { socket, connected };
}

// Chat Hook
export function useChat(socket: Socket | null, roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial messages
  useEffect(() => {
    if (!socket || !roomId) return;

    loadMessages();
  }, [socket, roomId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.roomId === roomId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.messageId === message.messageId)) {
            return prev;
          }
          return [...prev, message];
        });

        // Mark as read automatically
        socket.emit('message.read', {
          messageIds: [message.messageId],
          roomId: message.roomId,
        });
      }
    };

    const handleMessageEdited = (data: { messageId: string; roomId: string; content: string; editedAt: string }) => {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === data.messageId
              ? { ...msg, content: data.content, editedAt: data.editedAt }
              : msg
          )
        );
      }
    };

    const handleMessageDeleted = (data: { messageId: string; roomId: string }) => {
      if (data.roomId === roomId) {
        setMessages((prev) => prev.filter((msg) => msg.messageId !== data.messageId));
      }
    };

    const handleTypingUser = (data: { roomId: string; userId: string; userName: string; isTyping: boolean }) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            if (!prev.some((u) => u.userId === data.userId)) {
              return [...prev, { userId: data.userId, userName: data.userName }];
            }
          } else {
            return prev.filter((u) => u.userId !== data.userId);
          }
          return prev;
        });
      }
    };

    socket.on('message.received', handleNewMessage);
    socket.on('message.edited', handleMessageEdited);
    socket.on('message.deleted', handleMessageDeleted);
    socket.on('typing.user', handleTypingUser);

    return () => {
      socket.off('message.received', handleNewMessage);
      socket.off('message.edited', handleMessageEdited);
      socket.off('message.deleted', handleMessageDeleted);
      socket.off('typing.user', handleTypingUser);
    };
  }, [socket, roomId]);

  const loadMessages = async () => {
    if (!socket || loading) return;

    setLoading(true);
    try {
      const response = await socket.emitWithAck('message.history', {
        roomId,
        cursor,
        limit: 50,
        direction: 'before',
      });

      if (response.error) {
        console.error('Failed to load messages:', response.error);
        return;
      }

      setMessages((prev) => {
        const newMessages = response.messages.filter(
          (msg: Message) => !prev.some((m) => m.messageId === msg.messageId)
        );
        return [...newMessages, ...prev];
      });

      setCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text', metadata?: any) => {
    if (!socket) return;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage: Message = {
      messageId: tempId,
      roomId,
      senderId: 'me',
      senderName: 'You',
      content,
      type,
      metadata,
      timestamp: new Date().toISOString(),
      tempId,
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await socket.emitWithAck('message.send', {
        roomId,
        content,
        type,
        metadata,
        tempId,
      });

      if (response.error) {
        console.error('Failed to send message:', response.error);
        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        return;
      }

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId
            ? { ...msg, messageId: response.messageId, tempId: undefined }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    if (!socket) return;

    try {
      const response = await socket.emitWithAck('message.edit', {
        messageId,
        content,
        roomId,
      });

      if (response.error) {
        console.error('Failed to edit message:', response.error);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!socket) return;

    try {
      const response = await socket.emitWithAck('message.delete', {
        messageId,
        roomId,
      });

      if (response.error) {
        console.error('Failed to delete message:', response.error);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const startTyping = useCallback(() => {
    if (!socket) return;

    socket.emit('typing.start', { roomId });

    // Auto-stop typing after 5 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 5000);
  }, [socket, roomId]);

  const stopTyping = useCallback(() => {
    if (!socket) return;

    socket.emit('typing.stop', { roomId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [socket, roomId]);

  return {
    messages,
    typingUsers,
    loading,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMessages,
    startTyping,
    stopTyping,
  };
}

// Presence Hook
export function usePresence(socket: Socket | null) {
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});

  useEffect(() => {
    if (!socket) return;

    const handlePresenceOnline = (data: UserPresence) => {
      setPresenceMap((prev) => ({
        ...prev,
        [data.userId]: data,
      }));
    };

    const handlePresenceOffline = (data: UserPresence) => {
      setPresenceMap((prev) => ({
        ...prev,
        [data.userId]: data,
      }));
    };

    const handleStatusUpdate = (data: UserPresence) => {
      setPresenceMap((prev) => ({
        ...prev,
        [data.userId]: data,
      }));
    };

    socket.on('presence.online', handlePresenceOnline);
    socket.on('presence.offline', handlePresenceOffline);
    socket.on('presence.status.update', handleStatusUpdate);

    return () => {
      socket.off('presence.online', handlePresenceOnline);
      socket.off('presence.offline', handlePresenceOffline);
      socket.off('presence.status.update', handleStatusUpdate);
    };
  }, [socket]);

  const updateStatus = useCallback(
    (status: 'online' | 'away' | 'busy') => {
      if (!socket) return;
      socket.emit('presence.status.update', { status });
    },
    [socket]
  );

  return { presenceMap, updateStatus };
}

// Chat Component
export default function ChatRoom({ roomId, token }: { roomId: string; token: string }) {
  const { socket, connected } = useSocket(token);
  const { messages, typingUsers, sendMessage, startTyping, stopTyping, loadMessages, hasMore } = useChat(socket, roomId);
  const { presenceMap } = usePresence(socket);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      if (scrollTop === 0 && hasMore) {
        loadMessages();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
      stopTyping();
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Connecting to chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Chat Room</h1>
        <p className="text-sm text-gray-500">
          {connected ? 'Connected' : 'Disconnected'}
        </p>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.messageId}
            className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === 'me'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {message.senderId !== 'me' && (
                <p className="text-xs font-semibold mb-1">{message.senderName}</p>
              )}
              <p>{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.editedAt && ' (edited)'}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          {typingUsers.map((u) => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

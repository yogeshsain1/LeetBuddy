import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Smile, Send, Paperclip, Mic, MoreVertical, Phone, Video, 
  Search, ArrowLeft, Image as ImageIcon, File, X, Edit2, 
  Trash2, Reply, Check, CheckCheck, Clock
} from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import MessageReactions from './MessageReactions';
import FilePreview from './FilePreview';

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
    senderName: string;
  };
  reactions?: {
    emoji: string;
    userIds: string[];
  }[];
  metadata?: any;
  timestamp: string;
  editedAt?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  tempId?: string;
}

interface Contact {
  userId: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

interface Room {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  members: Contact[];
}

// Enhanced Socket Hook
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

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return { socket, connected };
}

// Enhanced Chat Hook
export function useChat(socket: Socket | null, roomId: string, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !roomId) return;
    loadMessages();
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.messageId === message.messageId)) {
            return prev;
          }
          return [...prev, message];
        });

        // Auto mark as read if message is visible
        if (message.senderId !== currentUserId) {
          socket.emit('message.read', {
            messageIds: [message.messageId],
            roomId: message.roomId,
          });
        }
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
      if (data.roomId === roomId && data.userId !== currentUserId) {
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

    const handleReadReceipt = (data: { userId: string; messageIds: string[]; roomId: string }) => {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (data.messageIds.includes(msg.messageId) && msg.senderId === currentUserId) {
              return { ...msg, status: 'read' };
            }
            return msg;
          })
        );
      }
    };

    socket.on('message.received', handleNewMessage);
    socket.on('message.edited', handleMessageEdited);
    socket.on('message.deleted', handleMessageDeleted);
    socket.on('typing.user', handleTypingUser);
    socket.on('message.read.receipt', handleReadReceipt);

    return () => {
      socket.off('message.received', handleNewMessage);
      socket.off('message.edited', handleMessageEdited);
      socket.off('message.deleted', handleMessageDeleted);
      socket.off('typing.user', handleTypingUser);
      socket.off('message.read.receipt', handleReadReceipt);
    };
  }, [socket, roomId, currentUserId]);

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

      if (!response.error) {
        setMessages((prev) => {
          const newMessages = response.messages.filter(
            (msg: Message) => !prev.some((m) => m.messageId === msg.messageId)
          );
          return [...newMessages, ...prev];
        });
        setCursor(response.nextCursor);
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    content: string, 
    type: 'text' | 'image' | 'file' = 'text', 
    metadata?: any
  ) => {
    if (!socket) return;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage: Message = {
      messageId: tempId,
      roomId,
      senderId: currentUserId,
      senderName: 'You',
      content,
      type,
      metadata,
      timestamp: new Date().toISOString(),
      status: 'sending',
      tempId,
      replyTo: replyingTo ? {
        messageId: replyingTo.messageId,
        content: replyingTo.content,
        senderId: replyingTo.senderId,
        senderName: replyingTo.senderName,
      } : undefined,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setReplyingTo(null);

    try {
      const response = await socket.emitWithAck('message.send', {
        roomId,
        content,
        type,
        metadata,
        tempId,
        replyToId: replyingTo?.messageId,
      });

      if (response.error) {
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? { ...msg, messageId: response.messageId, status: 'sent', tempId: undefined }
              : msg
          )
        );
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    if (!socket) return;

    try {
      await socket.emitWithAck('message.edit', { messageId, content, roomId });
      setEditingMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!socket) return;

    try {
      await socket.emitWithAck('message.delete', { messageId, roomId });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!socket) return;

    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.messageId === messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find((r) => r.emoji === emoji);
          
          if (existingReaction) {
            if (existingReaction.userIds.includes(currentUserId)) {
              // Remove reaction
              return {
                ...msg,
                reactions: reactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, userIds: r.userIds.filter((id) => id !== currentUserId) }
                    : r
                ).filter((r) => r.userIds.length > 0),
              };
            } else {
              // Add user to reaction
              return {
                ...msg,
                reactions: reactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, userIds: [...r.userIds, currentUserId] }
                    : r
                ),
              };
            }
          } else {
            // New reaction
            return {
              ...msg,
              reactions: [...reactions, { emoji, userIds: [currentUserId] }],
            };
          }
        }
        return msg;
      })
    );

    try {
      await socket.emitWithAck('message.react', { messageId, roomId, emoji });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const startTyping = useCallback(() => {
    if (!socket) return;

    socket.emit('typing.start', { roomId });

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
    replyingTo,
    editingMessage,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    loadMessages,
    startTyping,
    stopTyping,
    setReplyingTo,
    setEditingMessage,
  };
}

// Message Component
function MessageBubble({ 
  message, 
  isMe, 
  onReply, 
  onEdit, 
  onDelete, 
  onReact,
  currentUserId 
}: { 
  message: Message; 
  isMe: boolean; 
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  currentUserId: string;
}) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending': return <Clock className="w-3 h-3" />;
      case 'sent': return <Check className="w-3 h-3" />;
      case 'delivered': return <CheckCheck className="w-3 h-3" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div
      className={`group flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-md lg:max-w-lg ${isMe ? 'order-2' : 'order-1'}`}>
        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`text-xs mb-1 px-3 py-1 rounded-t-lg ${
            isMe ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            <div className="font-semibold">{message.replyTo.senderName}</div>
            <div className="truncate opacity-75">{message.replyTo.content}</div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isMe
              ? 'bg-blue-500 text-white rounded-tr-sm'
              : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
          }`}
        >
          {!isMe && message.senderName && (
            <p className="text-xs font-semibold mb-1 opacity-75">{message.senderName}</p>
          )}

          {/* Content */}
          {message.type === 'text' && <p className="break-words">{message.content}</p>}
          {message.type === 'image' && (
            <div>
              <img 
                src={message.metadata?.url} 
                alt="Shared" 
                className="rounded-lg max-w-full mb-2"
              />
              {message.content && <p className="break-words">{message.content}</p>}
            </div>
          )}
          {message.type === 'file' && (
            <FilePreview 
              fileName={message.metadata?.fileName}
              fileSize={message.metadata?.fileSize}
              url={message.metadata?.url}
            />
          )}

          {/* Timestamp & Status */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <p className="text-xs opacity-75">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
              {message.editedAt && ' (edited)'}
            </p>
            {isMe && getStatusIcon()}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact(message.messageId, reaction.emoji)}
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  reaction.userIds.includes(currentUserId)
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-100 border-gray-300'
                } hover:bg-gray-200 transition`}
              >
                {reaction.emoji} {reaction.userIds.length}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className={`flex items-center gap-1 mx-2 ${isMe ? 'order-1' : 'order-2'}`}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 rounded-full hover:bg-gray-200 transition"
            title="Add reaction"
          >
            <Smile className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onReply(message)}
            className="p-1.5 rounded-full hover:bg-gray-200 transition"
            title="Reply"
          >
            <Reply className="w-4 h-4 text-gray-600" />
          </button>
          {isMe && (
            <>
              <button
                onClick={() => onEdit(message)}
                className="p-1.5 rounded-full hover:bg-gray-200 transition"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(message.messageId)}
                className="p-1.5 rounded-full hover:bg-red-100 transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute z-50 mt-8">
          <EmojiPicker 
            onSelect={(emoji) => {
              onReact(message.messageId, emoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
    </div>
  );
}

// Enhanced Chat Room Component
export default function EnhancedChatRoom({ 
  roomId, 
  token, 
  currentUserId,
  roomName,
  roomAvatar,
  contact
}: { 
  roomId: string; 
  token: string;
  currentUserId: string;
  roomName?: string;
  roomAvatar?: string;
  contact?: Contact;
}) {
  const { socket, connected } = useSocket(token);
  const { 
    messages, 
    typingUsers, 
    sendMessage, 
    editMessage,
    deleteMessage,
    addReaction,
    startTyping, 
    stopTyping, 
    loadMessages, 
    hasMore,
    replyingTo,
    editingMessage,
    setReplyingTo,
    setEditingMessage,
  } = useChat(socket, roomId, currentUserId);

  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (editingMessage) {
      setInputValue(editingMessage.content);
    }
  }, [editingMessage]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      if (scrollTop === 0 && hasMore) {
        loadMessages();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      if (editingMessage) {
        editMessage(editingMessage.messageId, inputValue.trim());
        setEditingMessage(null);
      } else {
        sendMessage(inputValue.trim());
      }
      setInputValue('');
      stopTyping();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Upload file to server and get URL
    const fileUrl = 'https://example.com/file'; // Replace with actual upload
    
    sendMessage(file.name, file.type.startsWith('image/') ? 'image' : 'file', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url: fileUrl,
    });
  };

  const handleVoiceRecord = () => {
    // TODO: Implement voice recording
    setIsRecording(!isRecording);
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-700">Connecting to chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {roomAvatar && (
            <div className="relative">
              <img 
                src={roomAvatar} 
                alt={roomName} 
                className="w-10 h-10 rounded-full"
              />
              {contact?.status === 'online' && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
          )}
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{roomName || 'Chat'}</h1>
            <p className="text-sm text-gray-500">
              {typingUsers.length > 0 
                ? `${typingUsers.map(u => u.userName).join(', ')} typing...`
                : contact?.status === 'online' 
                  ? 'Active now' 
                  : contact?.lastSeen 
                    ? `Last seen ${new Date(contact.lastSeen).toLocaleString()}`
                    : 'Offline'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Voice call">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Video call">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Search">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition" title="More options">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.messageId}
            message={message}
            isMe={message.senderId === currentUserId}
            onReply={setReplyingTo}
            onEdit={setEditingMessage}
            onDelete={deleteMessage}
            onReact={addReaction}
            currentUserId={currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-blue-600 font-semibold">Replying to {replyingTo.senderName}</p>
            <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-amber-600 font-semibold">Editing message</p>
          </div>
          <button
            onClick={() => {
              setEditingMessage(null);
              setInputValue('');
            }}
            className="p-1 hover:bg-amber-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t shadow-lg p-4">
        <div className="flex items-end gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Add emoji"
            >
              <Smile className="w-6 h-6 text-gray-600" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Attach file"
            >
              <Paperclip className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ maxHeight: '120px' }}
            />
          </div>

          {inputValue.trim() ? (
            <button
              type="submit"
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-lg"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVoiceRecord}
              className={`p-3 rounded-full transition shadow-lg ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Voice message"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <EmojiPicker
            onSelect={(emoji) => {
              setInputValue((prev) => prev + emoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
    </div>
  );
}

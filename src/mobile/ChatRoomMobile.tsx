import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
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
  timestamp: string;
  editedAt?: string;
  tempId?: string;
}

interface TypingUser {
  userId: string;
  userName: string;
}

// Socket Hook for React Native
function useSocket(token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
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

// Chat Hook for React Native
function useChat(socket: Socket | null, roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
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

        // Auto mark as read
        socket.emit('message.read', {
          messageIds: [message.messageId],
          roomId: message.roomId,
        });
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
    socket.on('typing.user', handleTypingUser);

    return () => {
      socket.off('message.received', handleNewMessage);
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

  const sendMessage = async (content: string) => {
    if (!socket) return;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage: Message = {
      messageId: tempId,
      roomId,
      senderId: 'me',
      senderName: 'You',
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
      tempId,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await socket.emitWithAck('message.send', {
        roomId,
        content,
        type: 'text',
        tempId,
      });

      if (response.error) {
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? { ...msg, messageId: response.messageId, tempId: undefined }
              : msg
          )
        );
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
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
    sendMessage,
    loadMessages,
    startTyping,
    stopTyping,
  };
}

// Chat Component for React Native
export default function ChatRoomMobile({ roomId, token }: { roomId: string; token: string }) {
  const { socket, connected } = useSocket(token);
  const { messages, typingUsers, sendMessage, startTyping, stopTyping, loadMessages, hasMore } = useChat(socket, roomId);
  const [inputValue, setInputValue] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
      stopTyping();
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMessages();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {!isMe && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString()}
            {item.editedAt && ' (edited)'}
          </Text>
        </View>
      </View>
    );
  };

  if (!connected) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.connectingText}>Connecting to chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Room</Text>
        <Text style={styles.headerStatus}>
          {connected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId}
        contentContainerStyle={styles.messagesList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        inverted={false}
      />

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>
            {typingUsers.map((u) => u.userName).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!inputValue.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  connectingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
  },
  myMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  otherMessageText: {
    color: '#000',
    fontSize: 16,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 4,
  },
  typingContainer: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

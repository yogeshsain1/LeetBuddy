"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSocket, type Message as SocketMessage } from "@/contexts/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Search,
  Users,
  MessageCircle,
  UserCheck,
  Bell,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
  Trophy,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface Chat {
  id: string;
  roomId: number;
  username: string;
  realName: string;
  avatar: string;
  userId: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned: boolean;
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    isConnected,
    connect,
    onlineUsers,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    joinRoom,
    onNewMessage,
    onUserOnline,
    onUserOffline,
  } = useSocket();

  // Real chats data - starts empty, will be populated from database/API
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const result = await response.json();
        if (result.success) {
          setChats(result.data);
          // Auto-select first chat if available
          if (result.data.length > 0 && !selectedChat) {
            setSelectedChat(result.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchRooms();
  }, [selectedChat]);

  // Initialize Socket connection
  useEffect(() => {
    // TODO: Get actual userId from auth
    const userId = 1;
    if (!isConnected) {
      connect(userId);
    }
  }, [connect, isConnected]);

  // Join selected room
  useEffect(() => {
    if (selectedChat && isConnected) {
      const selectedChatData = chats.find((chat) => chat.id === selectedChat);
      if (selectedChatData) {
        joinRoom(selectedChatData.roomId);
      }
    }
  }, [selectedChat, isConnected, chats, joinRoom]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });
    return unsubscribe;
  }, [onNewMessage]);

  // Update online status
  useEffect(() => {
    const unsubscribeOnline = onUserOnline((userId) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.userId === userId ? { ...chat } : chat
        )
      );
    });
    
    const unsubscribeOffline = onUserOffline((userId) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.userId === userId ? { ...chat } : chat
        )
      );
    });

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [onUserOnline, onUserOffline]);

  // Check if user is online
  const isUserOnline = (userId: number) => onlineUsers.has(userId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.realName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((chat) => chat.isPinned);
  const regularChats = filteredChats.filter((chat) => !chat.isPinned);

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChatData || isSending) return;

    setIsSending(true);
    stopTyping(selectedChatData.roomId);

    const result = await sendMessage({
      roomId: selectedChatData.roomId,
      content: messageText.trim(),
    });

    if (result.success) {
      setMessageText("");
      if (result.message) {
        setMessages((prev) => [...prev, result.message!]);
        scrollToBottom();
      }
    }

    setIsSending(false);
  };

  const handleTyping = (value: string) => {
    setMessageText(value);

    if (!selectedChatData) return;

    if (value.trim()) {
      if (!isTyping) {
        startTyping(selectedChatData.roomId);
        setIsTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedChatData.roomId);
        setIsTyping(false);
      }, 2000);
    } else {
      stopTyping(selectedChatData.roomId);
      setIsTyping(false);
    }
  };

  // Get typing users for current room
  const currentRoomTyping = selectedChatData
    ? typingUsers.get(selectedChatData.roomId) || []
    : [];

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">LeetSocial</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/community">
                <Button variant="ghost" className="gap-2">
                  <Users className="w-5 h-5" />
                  Community
                </Button>
              </Link>
              <Link href="/friends">
                <Button variant="ghost" className="gap-2">
                  <UserCheck className="w-5 h-5" />
                  Friends
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" className="gap-2 relative">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                  {chats.reduce((sum, chat) => sum + chat.unreadCount, 0) > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {chats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
                    </motion.span>
                  )}
                </Button>
              </Link>
              <Link href="/activity">
                <Button variant="ghost" className="gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Activity
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost" className="gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" className="gap-2 relative">
                  <Bell className="w-5 h-5" />
                </Button>
              </Link>
              <ThemeToggle />
              
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: isConnected ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isConnected ? Infinity : 0,
                  }}
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {isConnected ? "Connected" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
        {/* Chat List Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="pl-11"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingChats ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : chats.length === 0 ? (
              <div className="flex items-center justify-center h-full px-4 text-center">
                <div>
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    No conversations yet
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Start a conversation with another user to begin chatting
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Pinned Chats */}
                {pinnedChats.length > 0 && (
                  <div className="mb-2">
                    <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Pinned
                    </p>
                    <AnimatePresence>
                      {pinnedChats.map((chat, index) => (
                        <motion.div
                          key={chat.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedChat(chat.id)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 transition-colors ${
                            selectedChat === chat.id
                              ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500"
                              : "border-transparent"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={chat.avatar}
                                alt={chat.username}
                                className="w-12 h-12 rounded-full"
                              />
                              {isUserOnline(chat.userId) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute bottom-0 right-0"
                                >
                                  <div className="relative w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full">
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [1, 0, 1],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                      }}
                                      className="absolute inset-0 bg-green-500 rounded-full -z-10"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  {chat.username}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                  {chat.lastMessageTime}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {chat.lastMessage}
                                </p>
                                {chat.unreadCount > 0 && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full flex-shrink-0"
                                  >
                                    {chat.unreadCount}
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

            {/* All Messages */}
            <div>
              {pinnedChats.length > 0 && (
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  All Messages
                </p>
              )}
              <AnimatePresence>
                {regularChats.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 transition-colors ${
                      selectedChat === chat.id
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={chat.avatar}
                          alt={chat.username}
                          className="w-12 h-12 rounded-full"
                        />
                        {isUserOnline(chat.userId) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {chat.username}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {chat.lastMessageTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {chat.lastMessage}
                          </p>
                          {chat.unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full flex-shrink-0"
                            >
                              {chat.unreadCount}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        {selectedChatData ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            {/* Chat Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedChatData.avatar}
                    alt={selectedChatData.username}
                    className="w-12 h-12 rounded-full"
                  />
                  {isUserOnline(selectedChatData.userId) && (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"
                    />
                  )}
                </div>
                <div>
                  <Link
                    href={`/profile/${selectedChatData.username}`}
                    className="font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    {selectedChatData.username}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isUserOnline(selectedChatData.userId) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.senderId === 1 ? "justify-end" : "justify-start"}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`max-w-[70%] ${
                        message.senderId === 1
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      } rounded-2xl px-4 py-2 shadow-sm`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <span
                          className={`text-xs ${
                            message.senderId === 1 ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.senderId === 1 && (
                          <span className="text-white/80">
                            <CheckCheck className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {currentRoomTyping.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {currentRoomTyping[0].username} is typing
                        </span>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -8, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="w-5 h-5" />
                </Button>
                <Input
                  type="text"
                  value={messageText}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending || !isConnected}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

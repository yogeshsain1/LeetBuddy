"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
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
  Archive,
  Trash2,
  Pin,
  Check,
  CheckCheck,
  Trophy,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status: "sent" | "delivered" | "read";
}

interface Chat {
  id: string;
  username: string;
  realName: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned: boolean;
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [messageText, setMessageText] = useState("");

  const chats: Chat[] = [
    {
      id: "1",
      username: "sarah_codes",
      realName: "Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=eab308",
      isOnline: true,
      lastMessage: "Hey! Did you solve today's daily challenge?",
      lastMessageTime: "2m ago",
      unreadCount: 2,
      isPinned: true,
    },
    {
      id: "2",
      username: "david_tree",
      realName: "David Lee",
      avatar: "https://ui-avatars.com/api/?name=David+Lee&background=8b5cf6",
      isOnline: true,
      lastMessage: "Thanks for the help with that DP problem!",
      lastMessageTime: "1h ago",
      unreadCount: 0,
      isPinned: true,
    },
    {
      id: "3",
      username: "mike_binary",
      realName: "Michael Rodriguez",
      avatar: "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=ef4444",
      isOnline: false,
      lastMessage: "Check out this graph algorithm approach",
      lastMessageTime: "3h ago",
      unreadCount: 1,
      isPinned: false,
    },
    {
      id: "4",
      username: "emma_dev",
      realName: "Emma Wilson",
      avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=3b82f6",
      isOnline: true,
      lastMessage: "Want to join our study group?",
      lastMessageTime: "1d ago",
      unreadCount: 0,
      isPinned: false,
    },
  ];

  const messages: Message[] = [
    {
      id: "1",
      text: "Hey! How's it going?",
      timestamp: "10:30 AM",
      isMe: false,
      status: "read",
    },
    {
      id: "2",
      text: "Great! Just finished solving a hard problem 🎉",
      timestamp: "10:32 AM",
      isMe: true,
      status: "read",
    },
    {
      id: "3",
      text: "Nice! Which one?",
      timestamp: "10:33 AM",
      isMe: false,
      status: "read",
    },
    {
      id: "4",
      text: "Longest Increasing Path in a Matrix. Took me 2 hours but finally got it!",
      timestamp: "10:35 AM",
      isMe: true,
      status: "read",
    },
    {
      id: "5",
      text: "That's awesome! I struggled with that one too. What approach did you use?",
      timestamp: "10:36 AM",
      isMe: false,
      status: "read",
    },
    {
      id: "6",
      text: "DFS with memoization. The key insight was caching the results for each cell.",
      timestamp: "10:38 AM",
      isMe: true,
      status: "delivered",
    },
    {
      id: "7",
      text: "Hey! Did you solve today's daily challenge?",
      timestamp: "Just now",
      isMe: false,
      status: "read",
    },
  ];

  const filteredChats = chats.filter(
    (chat) =>
      chat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.realName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((chat) => chat.isPinned);
  const regularChats = filteredChats.filter((chat) => !chat.isPinned);

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Send message:", messageText);
      setMessageText("");
      // TODO: API call to send message
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "sent") return <Check className="w-3 h-3" />;
    if (status === "delivered") return <CheckCheck className="w-3 h-3" />;
    if (status === "read") return <CheckCheck className="w-3 h-3 text-blue-500" />;
    return null;
  };

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
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
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
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
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
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div className="mb-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Pinned
                </p>
                {pinnedChats.map((chat) => (
                  <div
                    key={chat.id}
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
                        {chat.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
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
                            <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full flex-shrink-0">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Messages */}
            <div>
              {pinnedChats.length > 0 && (
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  All Messages
                </p>
              )}
              {regularChats.map((chat) => (
                <div
                  key={chat.id}
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
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
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
                          <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full flex-shrink-0">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        {selectedChatData ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedChatData.avatar}
                    alt={selectedChatData.username}
                    className="w-12 h-12 rounded-full"
                  />
                  {selectedChatData.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
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
                    {selectedChatData.isOnline ? "Online" : "Offline"}
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
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.isMe
                        ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    } rounded-2xl px-4 py-2 shadow-sm`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <span
                        className={`text-xs ${
                          message.isMe ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {message.timestamp}
                      </span>
                      {message.isMe && (
                        <span className="text-white/80">{getStatusIcon(message.status)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
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
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

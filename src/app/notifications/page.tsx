"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Code2,
  Users,
  UserCheck,
  MessageCircle,
  Bell,
  UserPlus,
  Trophy,
  Flame,
  Award,
  Eye,
  MessageSquare,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Notification {
  id: string;
  type: "friend_request" | "message" | "achievement" | "contest" | "profile_view" | "mention";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  icon: React.ReactNode;
  actionUrl?: string;
  avatar?: string;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "friend_request",
      title: "Friend Request",
      description: "alex_algorithm sent you a friend request",
      timestamp: "2 minutes ago",
      isRead: false,
      icon: <UserPlus className="w-5 h-5" />,
      actionUrl: "/friends",
      avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=10b981",
    },
    {
      id: "2",
      type: "message",
      title: "New Message",
      description: "sarah_codes: Hey! Did you solve today's daily challenge?",
      timestamp: "5 minutes ago",
      isRead: false,
      icon: <MessageCircle className="w-5 h-5" />,
      actionUrl: "/messages",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=eab308",
    },
    {
      id: "3",
      type: "achievement",
      title: "Achievement Unlocked! 🎉",
      description: "100 Day Streak - You've maintained a 100-day solving streak!",
      timestamp: "1 hour ago",
      isRead: false,
      icon: <Flame className="w-5 h-5" />,
      actionUrl: "/profile/john_coder",
    },
    {
      id: "4",
      type: "contest",
      title: "Contest Reminder",
      description: "Weekly Contest 372 starts in 30 minutes",
      timestamp: "2 hours ago",
      isRead: true,
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: "5",
      type: "profile_view",
      title: "Profile View",
      description: "mike_binary viewed your profile",
      timestamp: "3 hours ago",
      isRead: true,
      icon: <Eye className="w-5 h-5" />,
      actionUrl: "/profile/mike_binary",
      avatar: "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=ef4444",
    },
    {
      id: "6",
      type: "message",
      title: "New Message",
      description: "david_tree: Thanks for the help with that DP problem!",
      timestamp: "5 hours ago",
      isRead: true,
      icon: <MessageCircle className="w-5 h-5" />,
      actionUrl: "/messages",
      avatar: "https://ui-avatars.com/api/?name=David+Lee&background=8b5cf6",
    },
    {
      id: "7",
      type: "achievement",
      title: "New Badge Earned! 🏆",
      description: "Graph Master - Solved 50 graph problems",
      timestamp: "1 day ago",
      isRead: true,
      icon: <Award className="w-5 h-5" />,
      actionUrl: "/profile/john_coder",
    },
    {
      id: "8",
      type: "mention",
      title: "Mentioned in Chat",
      description: "emma_dev mentioned you in Dynamic Programming study group",
      timestamp: "1 day ago",
      isRead: true,
      icon: <MessageSquare className="w-5 h-5" />,
      actionUrl: "/messages",
      avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=3b82f6",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "friend_request":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "message":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "achievement":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "contest":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "profile_view":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "mention":
        return "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Button variant="ghost" className="gap-2 relative">
                  <UserCheck className="w-5 h-5" />
                  Friends
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    1
                  </span>
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
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </Button>
        </div>

        {/* Actions Bar */}
        <Card className="p-4 mb-6 bg-white dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={
                  filter === "all" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                }
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                onClick={() => setFilter("unread")}
                className={
                  filter === "unread" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                }
              >
                Unread ({unreadCount})
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 bg-white dark:bg-gray-900 hover:shadow-md transition-all ${
                !notification.isRead
                  ? "border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10"
                  : "border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon/Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  {notification.avatar ? (
                    <img
                      src={notification.avatar}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    notification.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {notification.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {notification.actionUrl && (
                      <Link href={notification.actionUrl}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                          onClick={() => markAsRead(notification.id)}
                        >
                          View
                        </Button>
                      </Link>
                    )}
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                        className="gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark as read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredNotifications.length === 0 && (
            <Card className="p-12 text-center bg-white dark:bg-gray-900">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

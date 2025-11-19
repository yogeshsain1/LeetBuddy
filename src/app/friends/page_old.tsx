"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Code2,
  Search,
  Users,
  UserPlus,
  UserMinus,
  MessageCircle,
  Check,
  X,
  Clock,
  UserCheck,
  Bell,
  Trophy,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Friend {
  id: string;
  username: string;
  realName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  mutualFriends: number;
  problemsSolved: number;
  status: "friends" | "pending-sent" | "pending-received" | "suggested";
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "online" | "pending" | "suggestions">("all");

  const friends: Friend[] = [
    {
      id: "1",
      username: "sarah_codes",
      realName: "Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=eab308",
      isOnline: true,
      lastSeen: "Online",
      mutualFriends: 12,
      problemsSolved: 867,
      status: "friends",
    },
    {
      id: "2",
      username: "david_tree",
      realName: "David Lee",
      avatar: "https://ui-avatars.com/api/?name=David+Lee&background=8b5cf6",
      isOnline: true,
      lastSeen: "Online",
      mutualFriends: 8,
      problemsSolved: 789,
      status: "friends",
    },
    {
      id: "3",
      username: "mike_binary",
      realName: "Michael Rodriguez",
      avatar: "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=ef4444",
      isOnline: false,
      lastSeen: "2 hours ago",
      mutualFriends: 5,
      problemsSolved: 1456,
      status: "friends",
    },
    {
      id: "4",
      username: "alex_algorithm",
      realName: "Alex Chen",
      avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=10b981",
      isOnline: false,
      lastSeen: "1 day ago",
      mutualFriends: 15,
      problemsSolved: 1234,
      status: "pending-received",
    },
    {
      id: "5",
      username: "emma_dev",
      realName: "Emma Wilson",
      avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=3b82f6",
      isOnline: false,
      lastSeen: "3 days ago",
      mutualFriends: 3,
      problemsSolved: 456,
      status: "pending-sent",
    },
    {
      id: "6",
      username: "lisa_array",
      realName: "Lisa Martinez",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Martinez&background=ec4899",
      isOnline: true,
      lastSeen: "Online",
      mutualFriends: 7,
      problemsSolved: 523,
      status: "suggested",
    },
  ];

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch =
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.realName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch && friend.status === "friends";
    if (activeTab === "online")
      return matchesSearch && friend.status === "friends" && friend.isOnline;
    if (activeTab === "pending")
      return matchesSearch && (friend.status === "pending-sent" || friend.status === "pending-received");
    if (activeTab === "suggestions")
      return matchesSearch && friend.status === "suggested";

    return matchesSearch;
  });

  const stats = {
    totalFriends: friends.filter((f) => f.status === "friends").length,
    onlineFriends: friends.filter((f) => f.status === "friends" && f.isOnline).length,
    pendingRequests: friends.filter((f) => f.status === "pending-received").length,
    suggestions: friends.filter((f) => f.status === "suggested").length,
  };

  const handleAcceptRequest = (friendId: string) => {
    console.log("Accept friend request:", friendId);
    // TODO: API call to accept friend request
  };

  const handleDeclineRequest = (friendId: string) => {
    console.log("Decline friend request:", friendId);
    // TODO: API call to decline friend request
  };

  const handleCancelRequest = (friendId: string) => {
    console.log("Cancel friend request:", friendId);
    // TODO: API call to cancel sent request
  };

  const handleAddFriend = (friendId: string) => {
    console.log("Send friend request:", friendId);
    // TODO: API call to send friend request
  };

  const handleRemoveFriend = (friendId: string) => {
    console.log("Remove friend:", friendId);
    // TODO: API call to remove friend
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
                  {stats.pendingRequests > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.pendingRequests}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" className="gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Friends</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage your coding connections
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalFriends}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Friends</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.onlineFriends}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Online Now</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingRequests}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <UserPlus className="w-10 h-10 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.suggestions}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Suggestions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Tabs */}
        <Card className="p-6 mb-6 bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => setActiveTab("all")}
                className={activeTab === "all" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}
              >
                All Friends ({stats.totalFriends})
              </Button>
              <Button
                variant={activeTab === "online" ? "default" : "outline"}
                onClick={() => setActiveTab("online")}
                className={activeTab === "online" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}
              >
                Online ({stats.onlineFriends})
              </Button>
              <Button
                variant={activeTab === "pending" ? "default" : "outline"}
                onClick={() => setActiveTab("pending")}
                className={activeTab === "pending" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}
              >
                Pending ({stats.pendingRequests})
                {stats.pendingRequests > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {stats.pendingRequests}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === "suggestions" ? "default" : "outline"}
                onClick={() => setActiveTab("suggestions")}
                className={activeTab === "suggestions" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}
              >
                Suggestions ({stats.suggestions})
              </Button>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="pl-11 w-full sm:w-64"
              />
            </div>
          </div>

          {/* Friends List */}
          <div className="space-y-4">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="w-14 h-14 rounded-full"
                  />
                  {friend.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${friend.username}`}
                    className="font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    {friend.username}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{friend.realName}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{friend.lastSeen}</span>
                    <span>•</span>
                    <span>{friend.mutualFriends} mutual friends</span>
                    <span>•</span>
                    <span>{friend.problemsSolved} problems</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {friend.status === "friends" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          window.location.href = `/messages?user=${friend.username}`;
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {friend.status === "pending-received" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        onClick={() => handleAcceptRequest(friend.id)}
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 gap-2"
                        onClick={() => handleDeclineRequest(friend.id)}
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </Button>
                    </>
                  )}

                  {friend.status === "pending-sent" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleCancelRequest(friend.id)}
                    >
                      <Clock className="w-4 h-4" />
                      Cancel Request
                    </Button>
                  )}

                  {friend.status === "suggested" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2"
                      onClick={() => handleAddFriend(friend.id)}
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Friend
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredFriends.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No friends found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {activeTab === "suggestions"
                    ? "Check back later for friend suggestions"
                    : "Try adjusting your search"}
                </p>
                {activeTab !== "suggestions" && (
                  <Link href="/community">
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                      Discover LeetCoders
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

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
  MessageCircle,
  Trophy,
  Filter,
  SlidersHorizontal,
  UserCheck,
  Bell,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface User {
  id: string;
  username: string;
  realName: string;
  avatar: string;
  level: "Easy" | "Medium" | "Hard" | "Expert";
  problemsSolved: number;
  contestRating: number;
  streak: number;
  isOnline: boolean;
  isFriend: boolean;
  bio: string;
}

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "problems" | "streak">("rating");

  const users: User[] = [
    {
      id: "1",
      username: "alex_algorithm",
      realName: "Alex Chen",
      avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=10b981",
      level: "Expert",
      problemsSolved: 1234,
      contestRating: 2156,
      streak: 89,
      isOnline: true,
      isFriend: false,
      bio: "FAANG SDE • Loves Dynamic Programming",
    },
    {
      id: "2",
      username: "sarah_codes",
      realName: "Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=eab308",
      level: "Hard",
      problemsSolved: 867,
      contestRating: 1923,
      streak: 47,
      isOnline: true,
      isFriend: true,
      bio: "Full Stack Dev • Graph algorithms enthusiast",
    },
    {
      id: "3",
      username: "mike_binary",
      realName: "Michael Rodriguez",
      avatar: "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=ef4444",
      level: "Expert",
      problemsSolved: 1456,
      contestRating: 2289,
      streak: 123,
      isOnline: false,
      isFriend: false,
      bio: "Competitive Programming • Top 1% Global",
    },
    {
      id: "4",
      username: "emma_dev",
      realName: "Emma Wilson",
      avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=3b82f6",
      level: "Medium",
      problemsSolved: 456,
      contestRating: 1654,
      streak: 32,
      isOnline: true,
      isFriend: false,
      bio: "Learning DSA • Backend Developer",
    },
    {
      id: "5",
      username: "david_tree",
      realName: "David Lee",
      avatar: "https://ui-avatars.com/api/?name=David+Lee&background=8b5cf6",
      level: "Hard",
      problemsSolved: 789,
      contestRating: 1876,
      streak: 56,
      isOnline: true,
      isFriend: true,
      bio: "Tree & Graph problems specialist",
    },
    {
      id: "6",
      username: "lisa_array",
      realName: "Lisa Martinez",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Martinez&background=ec4899",
      level: "Medium",
      problemsSolved: 523,
      contestRating: 1745,
      streak: 28,
      isOnline: false,
      isFriend: false,
      bio: "Frontend Engineer • Array manipulations pro",
    },
  ];

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = selectedLevel === "all" || user.level === selectedLevel;
      
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.contestRating - a.contestRating;
      if (sortBy === "problems") return b.problemsSolved - a.problemsSolved;
      if (sortBy === "streak") return b.streak - a.streak;
      return 0;
    });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Easy":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "Hard":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "Expert":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      default:
        return "";
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
                <Button variant="ghost" className="gap-2">
                  <UserCheck className="w-5 h-5" />
                  Friends
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
              <Link href="/profile/john_coder">
                <Button variant="ghost">Profile</Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Discover LeetCoders
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Connect with {users.length.toLocaleString()}+ developers solving problems together
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="p-6 mb-6 bg-white dark:bg-gray-900">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username, name, or bio..."
                  className="h-12 pl-11"
                />
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full h-12 px-4 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-12 px-4 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="rating">Sort by Rating</option>
                <option value="problems">Sort by Problems</option>
                <option value="streak">Sort by Streak</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white dark:bg-gray-900 text-center">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-gray-900 text-center">
            <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.filter((u) => u.isOnline).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Online Now</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-gray-900 text-center">
            <UserPlus className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.filter((u) => u.isFriend).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your Friends</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-gray-900 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.max(...users.map((u) => u.contestRating))}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Top Rating</p>
          </Card>
        </div>

        {/* User Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="p-6 bg-white dark:bg-gray-900 hover:shadow-xl transition-all border-2 border-gray-100 dark:border-gray-800 hover:border-orange-500 dark:hover:border-orange-500"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-16 h-16 rounded-full"
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${user.username}`}
                    className="font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 text-lg"
                  >
                    {user.username}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.realName}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${getLevelColor(user.level)}`}>
                    {user.level}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {user.bio}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {user.problemsSolved}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Problems</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {user.contestRating}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {user.streak}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
                </div>
              </div>

              <div className="flex gap-2">
                {user.isFriend ? (
                  <Button className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1 gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </Button>
                )}
                <Link href={`/profile/${user.username}`}>
                  <Button variant="outline">View</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center bg-white dark:bg-gray-900">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

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
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Filter,
  Calendar,
  Target,
  Award,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface LeaderboardUser {
  rank: number;
  username: string;
  realName: string;
  avatar: string;
  problemsSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  contestRating: number;
  streak: number;
  isMe: boolean;
  isFriend: boolean;
  rankChange: number; // positive = moved up, negative = moved down
}

export default function LeaderboardPage() {
  const [scope, setScope] = useState<"global" | "friends" | "country">("global");
  const [timeframe, setTimeframe] = useState<"all-time" | "monthly" | "weekly">("all-time");
  const [sortBy, setSortBy] = useState<"problems" | "rating" | "streak">("problems");

  const leaderboardData: LeaderboardUser[] = [
    {
      rank: 1,
      username: "code_ninja_pro",
      realName: "Robert Zhang",
      avatar: "https://ui-avatars.com/api/?name=Robert+Zhang&background=fbbf24",
      problemsSolved: 2456,
      easyCount: 856,
      mediumCount: 1234,
      hardCount: 366,
      contestRating: 3012,
      streak: 345,
      isMe: false,
      isFriend: false,
      rankChange: 0,
    },
    {
      rank: 2,
      username: "algorithm_queen",
      realName: "Jessica Liu",
      avatar: "https://ui-avatars.com/api/?name=Jessica+Liu&background=c0c0c0",
      problemsSolved: 2389,
      easyCount: 823,
      mediumCount: 1198,
      hardCount: 368,
      contestRating: 2967,
      streak: 289,
      isMe: false,
      isFriend: false,
      rankChange: 1,
    },
    {
      rank: 3,
      username: "dp_master",
      realName: "Kevin Park",
      avatar: "https://ui-avatars.com/api/?name=Kevin+Park&background=cd7f32",
      problemsSolved: 2301,
      easyCount: 798,
      mediumCount: 1167,
      hardCount: 336,
      contestRating: 2889,
      streak: 267,
      isMe: false,
      isFriend: false,
      rankChange: -1,
    },
    {
      rank: 4,
      username: "mike_binary",
      realName: "Michael Rodriguez",
      avatar: "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=ef4444",
      problemsSolved: 1456,
      easyCount: 456,
      mediumCount: 723,
      hardCount: 277,
      contestRating: 2289,
      streak: 123,
      isMe: false,
      isFriend: true,
      rankChange: 2,
    },
    {
      rank: 5,
      username: "alex_algorithm",
      realName: "Alex Chen",
      avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=10b981",
      problemsSolved: 1234,
      easyCount: 423,
      mediumCount: 634,
      hardCount: 177,
      contestRating: 2156,
      streak: 89,
      isMe: false,
      isFriend: true,
      rankChange: -1,
    },
    {
      rank: 6,
      username: "john_coder",
      realName: "John Doe",
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=3b82f6",
      problemsSolved: 1089,
      easyCount: 398,
      mediumCount: 567,
      hardCount: 124,
      contestRating: 1987,
      streak: 67,
      isMe: true,
      isFriend: false,
      rankChange: 3,
    },
    {
      rank: 7,
      username: "sarah_codes",
      realName: "Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=eab308",
      problemsSolved: 867,
      easyCount: 345,
      mediumCount: 423,
      hardCount: 99,
      contestRating: 1923,
      streak: 47,
      isMe: false,
      isFriend: true,
      rankChange: 0,
    },
    {
      rank: 8,
      username: "david_tree",
      realName: "David Lee",
      avatar: "https://ui-avatars.com/api/?name=David+Lee&background=8b5cf6",
      problemsSolved: 789,
      easyCount: 312,
      mediumCount: 389,
      hardCount: 88,
      contestRating: 1876,
      streak: 56,
      isMe: false,
      isFriend: true,
      rankChange: -2,
    },
    {
      rank: 9,
      username: "lisa_array",
      realName: "Lisa Martinez",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Martinez&background=ec4899",
      problemsSolved: 523,
      easyCount: 234,
      mediumCount: 234,
      hardCount: 55,
      contestRating: 1745,
      streak: 28,
      isMe: false,
      isFriend: false,
      rankChange: 1,
    },
    {
      rank: 10,
      username: "emma_dev",
      realName: "Emma Wilson",
      avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=3b82f6",
      problemsSolved: 456,
      easyCount: 198,
      mediumCount: 198,
      hardCount: 60,
      contestRating: 1654,
      streak: 32,
      isMe: false,
      isFriend: false,
      rankChange: -1,
    },
  ];

  const filteredData =
    scope === "friends" ? leaderboardData.filter((user) => user.isFriend || user.isMe) : leaderboardData;

  const myRank = leaderboardData.find((user) => user.isMe);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-600";
    return "bg-gray-200 dark:bg-gray-700";
  };

  const getRankChangeIndicator = (change: number) => {
    if (change > 0)
      return (
        <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
          ↑ {change}
        </span>
      );
    if (change < 0)
      return (
        <span className="text-red-600 dark:text-red-400 text-sm font-semibold">
          ↓ {Math.abs(change)}
        </span>
      );
    return <span className="text-gray-400 text-sm">—</span>;
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
                <Button variant="ghost" className="gap-2 relative">
                  <MessageCircle className="w-5 h-5" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Compete with the best problem solvers
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* My Rank Card */}
          {myRank && (
            <Card className="lg:col-span-3 p-6 bg-gradient-to-r from-orange-500 to-yellow-500">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={myRank.avatar}
                    alt={myRank.username}
                    className="w-20 h-20 rounded-full border-4 border-white"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                    #{myRank.rank}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">Your Rank</h3>
                  <p className="text-white/90 mb-2">@{myRank.username}</p>
                  <div className="flex items-center gap-4 text-white">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {myRank.problemsSolved} solved
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {myRank.contestRating} rating
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {myRank.streak} day streak
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {getRankChangeIndicator(myRank.rankChange)}
                  <p className="text-white/90 text-sm mt-1">vs last week</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-white dark:bg-gray-900">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Scope Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Scope
              </label>
              <div className="flex gap-2">
                <Button
                  variant={scope === "global" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScope("global")}
                  className={
                    scope === "global" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  Global
                </Button>
                <Button
                  variant={scope === "friends" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScope("friends")}
                  className={
                    scope === "friends" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  Friends
                </Button>
                <Button
                  variant={scope === "country" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScope("country")}
                  className={
                    scope === "country" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  Country
                </Button>
              </div>
            </div>

            {/* Timeframe Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Timeframe
              </label>
              <div className="flex gap-2">
                <Button
                  variant={timeframe === "all-time" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("all-time")}
                  className={
                    timeframe === "all-time" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  All Time
                </Button>
                <Button
                  variant={timeframe === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("monthly")}
                  className={
                    timeframe === "monthly" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  Monthly
                </Button>
                <Button
                  variant={timeframe === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("weekly")}
                  className={
                    timeframe === "weekly" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  Weekly
                </Button>
              </div>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="problems">Problems Solved</option>
                <option value="rating">Contest Rating</option>
                <option value="streak">Streak</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Top 3 Podium */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {filteredData.slice(0, 3).map((user, index) => (
            <Card
              key={user.username}
              className={`p-6 text-center ${
                index === 0
                  ? "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 md:order-2"
                  : index === 1
                  ? "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 md:order-1"
                  : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 md:order-3"
              }`}
            >
              <div className="relative inline-block mb-4">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 mx-auto"
                />
                <div
                  className={`absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center ${getRankBadge(
                    user.rank
                  )} text-white font-bold`}
                >
                  {user.rank}
                </div>
              </div>
              <div className="mb-2">{getRankIcon(user.rank)}</div>
              <Link
                href={`/profile/${user.username}`}
                className="font-bold text-lg text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
              >
                {user.username}
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{user.realName}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Problems:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.problemsSolved}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.contestRating}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Streak:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.streak} days
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard Table */}
        <Card className="bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Problems
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Easy/Med/Hard
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Streak
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((user) => (
                  <tr
                    key={user.username}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      user.isMe ? "bg-orange-50 dark:bg-orange-900/20" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-lg ${
                            user.rank <= 3
                              ? "text-transparent bg-clip-text " + getRankBadge(user.rank)
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          #{user.rank}
                        </span>
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <Link
                            href={`/profile/${user.username}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-2"
                          >
                            {user.username}
                            {user.isMe && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
                                You
                              </span>
                            )}
                            {user.isFriend && !user.isMe && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                                Friend
                              </span>
                            )}
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.realName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {user.problemsSolved}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-green-600 dark:text-green-400">{user.easyCount}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {user.mediumCount}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-600 dark:text-red-400">{user.hardCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {user.contestRating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4" />
                        {user.streak}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getRankChangeIndicator(user.rankChange)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

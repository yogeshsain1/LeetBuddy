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
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LeaderboardUser {
  id: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  totalSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  contestRating: number;
  currentStreak: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"global" | "friends">("global");

  useEffect(() => {
    fetchLeaderboard();
  }, [scope]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?scope=${scope}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
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
            See who's solving the most problems
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex gap-2">
            <Button
              variant={scope === "global" ? "default" : "outline"}
              onClick={() => setScope("global")}
              className={
                scope === "global" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
              }
            >
              Global
            </Button>
            <Button
              variant={scope === "friends" ? "default" : "outline"}
              onClick={() => setScope("friends")}
              className={
                scope === "friends" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
              }
            >
              Friends Only
            </Button>
          </div>
        </Card>

        {/* Leaderboard */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : users.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Users Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {scope === "friends"
                ? "Add some friends to see their rankings!"
                : "Be the first to add your LeetCode stats!"}
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
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
                      Total Solved
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 115, 22, 0.05)" }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.username
                              )}&background=random`
                            }
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <Link
                              href={`/profile/${user.username}`}
                              className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                            >
                              {user.username}
                            </Link>
                            {user.fullName && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {user.fullName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {user.totalSolved}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <span className="text-green-600 dark:text-green-400">
                            {user.easyCount}
                          </span>
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
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          🔥 {user.currentStreak}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

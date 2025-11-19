"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Code2,
  Users,
  UserCheck,
  MessageCircle,
  Bell,
  Heart,
  MessageSquare,
  Share2,
  Trophy,
  Flame,
  Award,
  CheckCircle,
  Target,
  TrendingUp,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Activity {
  id: string;
  type: "problem_solved" | "contest_participated" | "badge_earned" | "streak_milestone";
  user: {
    username: string;
    realName: string;
    avatar: string;
  };
  content: {
    title: string;
    difficulty?: "Easy" | "Medium" | "Hard";
    badge?: string;
    details?: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isFriend: boolean;
}

export default function ActivityFeedPage() {
  const [filter, setFilter] = useState<"all" | "friends">("all");
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      type: "problem_solved",
      user: {
        username: "sarah_codes",
        realName: "Sarah Johnson",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=eab308",
      },
      content: {
        title: "Two Sum",
        difficulty: "Easy",
        details: "Solved in 5 minutes using HashMap approach",
      },
      timestamp: "2 minutes ago",
      likes: 12,
      comments: 3,
      isLiked: false,
      isFriend: true,
    },
    {
      id: "2",
      type: "contest_participated",
      user: {
        username: "mike_binary",
        realName: "Michael Rodriguez",
        avatar: "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=ef4444",
      },
      content: {
        title: "Weekly Contest 372",
        details: "Ranked #156 globally • Solved 3/4 problems",
      },
      timestamp: "15 minutes ago",
      likes: 28,
      comments: 7,
      isLiked: true,
      isFriend: false,
    },
    {
      id: "3",
      type: "badge_earned",
      user: {
        username: "david_tree",
        realName: "David Lee",
        avatar: "https://ui-avatars.com/api/?name=David+Lee&background=8b5cf6",
      },
      content: {
        title: "Graph Master",
        badge: "🏆",
        details: "Solved 50 graph problems",
      },
      timestamp: "1 hour ago",
      likes: 45,
      comments: 12,
      isLiked: true,
      isFriend: true,
    },
    {
      id: "4",
      type: "problem_solved",
      user: {
        username: "alex_algorithm",
        realName: "Alex Chen",
        avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=10b981",
      },
      content: {
        title: "Longest Increasing Path in a Matrix",
        difficulty: "Hard",
        details: "DFS + Memoization • Time: O(m*n)",
      },
      timestamp: "2 hours ago",
      likes: 67,
      comments: 15,
      isLiked: false,
      isFriend: false,
    },
    {
      id: "5",
      type: "streak_milestone",
      user: {
        username: "emma_dev",
        realName: "Emma Wilson",
        avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=3b82f6",
      },
      content: {
        title: "100 Day Streak",
        badge: "🔥",
        details: "Solved problems for 100 consecutive days!",
      },
      timestamp: "3 hours ago",
      likes: 89,
      comments: 24,
      isLiked: true,
      isFriend: false,
    },
    {
      id: "6",
      type: "problem_solved",
      user: {
        username: "lisa_array",
        realName: "Lisa Martinez",
        avatar: "https://ui-avatars.com/api/?name=Lisa+Martinez&background=ec4899",
      },
      content: {
        title: "Median of Two Sorted Arrays",
        difficulty: "Hard",
        details: "Binary Search approach • First Hard problem solved!",
      },
      timestamp: "5 hours ago",
      likes: 156,
      comments: 32,
      isLiked: false,
      isFriend: false,
    },
    {
      id: "7",
      type: "contest_participated",
      user: {
        username: "sarah_codes",
        realName: "Sarah Johnson",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=eab308",
      },
      content: {
        title: "Biweekly Contest 118",
        details: "Ranked #89 globally • Solved 4/4 problems • New personal best!",
      },
      timestamp: "1 day ago",
      likes: 234,
      comments: 45,
      isLiked: true,
      isFriend: true,
    },
  ]);

  const filteredActivities =
    filter === "friends" ? activities.filter((a) => a.isFriend) : activities;

  const handleLike = (id: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              isLiked: !activity.isLiked,
              likes: activity.isLiked ? activity.likes - 1 : activity.likes + 1,
            }
          : activity
      )
    );
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (difficulty === "Easy")
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    if (difficulty === "Medium")
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
    if (difficulty === "Hard")
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    return "";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "problem_solved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "contest_participated":
        return <Trophy className="w-5 h-5 text-purple-500" />;
      case "badge_earned":
        return <Award className="w-5 h-5 text-yellow-500" />;
      case "streak_milestone":
        return <Flame className="w-5 h-5 text-orange-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case "problem_solved":
        return (
          <>
            solved{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {activity.content.title}
            </span>
          </>
        );
      case "contest_participated":
        return (
          <>
            participated in{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {activity.content.title}
            </span>
          </>
        );
      case "badge_earned":
        return (
          <>
            earned the{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {activity.content.badge} {activity.content.title}
            </span>{" "}
            badge
          </>
        );
      case "streak_milestone":
        return (
          <>
            achieved{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {activity.content.badge} {activity.content.title}
            </span>
          </>
        );
      default:
        return null;
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Activity Feed</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            See what the community is achieving
          </p>
        </div>

        {/* Filter Tabs */}
        <Card className="p-4 mb-6 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              All Activity
            </Button>
            <Button
              variant={filter === "friends" ? "default" : "outline"}
              onClick={() => setFilter("friends")}
              className={
                filter === "friends" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
              }
            >
              <Users className="w-4 h-4 mr-2" />
              Friends Only
            </Button>
          </div>
        </Card>

        {/* Activity Feed */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="p-6 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                {/* User Avatar */}
                <Link href={`/profile/${activity.user.username}`}>
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.username}
                    className="w-12 h-12 rounded-full hover:ring-2 hover:ring-orange-500 transition-all"
                  />
                </Link>

                <div className="flex-1">
                  {/* Activity Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-gray-600 dark:text-gray-300">
                        <Link
                          href={`/profile/${activity.user.username}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                        >
                          {activity.user.username}
                        </Link>{" "}
                        {getActivityTitle(activity)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      {activity.content.difficulty && (
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getDifficultyColor(
                            activity.content.difficulty
                          )}`}
                        >
                          {activity.content.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Activity Details */}
                  {activity.content.details && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {activity.content.details}
                      </p>
                    </div>
                  )}

                  {/* Interaction Buttons */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(activity.id)}
                      className={`gap-2 ${
                        activity.isLiked
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${activity.isLiked ? "fill-red-500" : ""}`}
                      />
                      {activity.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-gray-600 dark:text-gray-400"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {activity.comments}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-gray-600 dark:text-gray-400"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Load More Activities
          </Button>
        </div>
      </div>
    </div>
  );
}

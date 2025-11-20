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
  CheckCircle,
  Award,
  Flame,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  activityType: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "friends">("all");

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activities?filter=${filter}`);
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "problem_solved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "streak_milestone":
        return <Flame className="w-5 h-5 text-orange-500" />;
      case "friend_added":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      default:
        return <Award className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Activity Feed</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            See what everyone is achieving
          </p>
        </div>

        {/* Filter */}
        <Card className="p-4 mb-6">
          <div className="flex gap-2">
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

        {/* Activities */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : activities.length === 0 ? (
          <Card className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Activities Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "friends"
                ? "Your friends haven't done anything yet. Encourage them to start solving!"
                : "Be the first to solve a problem and create some activity!"}
            </p>
          </Card>
        ) : (
          <AnimatePresence>
            <motion.div 
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.07
                  }
                }
              }}
            >
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-2 hover:border-orange-200 dark:hover:border-orange-800">
                <div className="flex gap-4">
                  <Link href={`/profile/${activity.username}`}>
                    <img
                      src={
                        activity.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          activity.username
                        )}&background=random`
                      }
                      alt={activity.username}
                      className="w-12 h-12 rounded-full hover:ring-2 hover:ring-orange-500 transition-all"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300">
                          <Link
                            href={`/profile/${activity.username}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                          >
                            {activity.username}
                          </Link>{" "}
                          <span className="font-bold text-gray-900 dark:text-white">
                            {activity.title}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {getRelativeTime(activity.createdAt)}
                        </p>
                      </div>
                      {getActivityIcon(activity.activityType)}
                    </div>

                    {activity.description && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {activity.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

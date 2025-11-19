"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Code2,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Flame,
  Star,
  CheckCircle2,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Crown,
  Medal,
  MessageCircle,
  Settings,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface LeetCodeStats {
  username: string;
  realName: string;
  avatar: string;
  ranking: number;
  reputation: number;
  problemsSolved: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  acceptanceRate: number;
  contributionPoints: number;
  contestRating: number;
  contestRanking: number;
  globalRanking: number;
  totalContests: number;
  topPercentage: number;
  streak: {
    current: number;
    longest: number;
  };
  recentSubmissions: Array<{
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    timestamp: string;
    status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded";
  }>;
  badges: Array<{
    name: string;
    icon: string;
    description: string;
  }>;
  skills: Array<{
    name: string;
    problemsSolved: number;
  }>;
  languageStats: Array<{
    language: string;
    problemsSolved: number;
  }>;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching LeetCode data
    // In production, this would call the LeetCode API
    setTimeout(() => {
      setStats({
        username: username || "john_coder",
        realName: "John Developer",
        avatar: `https://ui-avatars.com/api/?name=${username}&size=200&background=random`,
        ranking: 125847,
        reputation: 2847,
        problemsSolved: {
          total: 456,
          easy: 178,
          medium: 234,
          hard: 44,
        },
        acceptanceRate: 68.5,
        contributionPoints: 1245,
        contestRating: 1876,
        contestRanking: 8234,
        globalRanking: 15234,
        totalContests: 24,
        topPercentage: 12.5,
        streak: {
          current: 47,
          longest: 89,
        },
        recentSubmissions: [
          { title: "Two Sum", difficulty: "Easy", timestamp: "2 hours ago", status: "Accepted" },
          { title: "Longest Palindromic Substring", difficulty: "Medium", timestamp: "5 hours ago", status: "Accepted" },
          { title: "Median of Two Sorted Arrays", difficulty: "Hard", timestamp: "1 day ago", status: "Accepted" },
          { title: "Regular Expression Matching", difficulty: "Hard", timestamp: "2 days ago", status: "Wrong Answer" },
        ],
        badges: [
          { name: "50 Days Badge", icon: "🔥", description: "Solved problems for 50 days straight" },
          { name: "Knight", icon: "⚔️", description: "Contest rating above 1800" },
          { name: "Daily Coding Challenge", icon: "📅", description: "Completed 30 day challenge" },
          { name: "100 Problems", icon: "💯", description: "Solved 100 problems" },
        ],
        skills: [
          { name: "Array", problemsSolved: 156 },
          { name: "Dynamic Programming", problemsSolved: 89 },
          { name: "Hash Table", problemsSolved: 78 },
          { name: "Two Pointers", problemsSolved: 67 },
          { name: "Binary Search", problemsSolved: 54 },
          { name: "Sliding Window", problemsSolved: 43 },
        ],
        languageStats: [
          { language: "Python", problemsSolved: 234 },
          { language: "JavaScript", problemsSolved: 123 },
          { language: "Java", problemsSolved: 99 },
        ],
      });
      setIsLoading(false);
    }, 1000);
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const difficultyColors = {
    Easy: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
    Medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30",
    Hard: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
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
              <Button variant="ghost" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-6 bg-gradient-to-br from-orange-500 to-yellow-500 text-white border-0">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={stats.avatar}
              alt={stats.username}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
            />
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-bold">{stats.username}</h1>
                <Crown className="w-8 h-8 fill-yellow-300 text-yellow-300" />
              </div>
              <p className="text-orange-100 text-lg mb-4">{stats.realName}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Rank #{stats.ranking.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                  <Flame className="w-5 h-5" />
                  <span className="font-semibold">{stats.streak.current} Day Streak</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 fill-white" />
                  <span className="font-semibold">{stats.reputation} Points</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-white text-orange-600 hover:bg-orange-50 gap-2">
                <Share2 className="w-5 h-5" />
                Share Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Easy Problems</h3>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.problemsSolved.easy}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(stats.problemsSolved.easy / 200) * 100}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Medium Problems</h3>
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.problemsSolved.medium}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${(stats.problemsSolved.medium / 300) * 100}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Hard Problems</h3>
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.problemsSolved.hard}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${(stats.problemsSolved.hard / 100) * 100}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Solved</h3>
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.problemsSolved.total}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.acceptanceRate}% acceptance rate
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Contest Stats */}
          <Card className="p-6 bg-white dark:bg-gray-900 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              Contest Performance
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contest Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.contestRating}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contest Rank</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">#{stats.contestRanking.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Global Ranking</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">#{stats.globalRanking.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Percentage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.topPercentage}%</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Medal className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Participated in {stats.totalContests} contests
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep competing to improve your ranking!
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Streak */}
          <Card className="p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Streak
            </h2>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full mb-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-white">{stats.streak.current}</p>
                  <p className="text-sm text-orange-100">days</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.streak.longest} days</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Contribution Points</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.contributionPoints}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Badges */}
          <Card className="p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-orange-500" />
              Badges & Achievements
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {stats.badges.map((badge, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-orange-500" />
              Recent Submissions
            </h2>
            
            <div className="space-y-3">
              {stats.recentSubmissions.map((submission, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {submission.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyColors[submission.difficulty]}`}>
                      {submission.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {submission.status === "Accepted" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-red-600" />
                      )}
                      <span className={submission.status === "Accepted" ? "text-green-600" : "text-red-600"}>
                        {submission.status}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">{submission.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Skills */}
          <Card className="p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-500" />
              Skills by Topic
            </h2>
            
            <div className="space-y-4">
              {stats.skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{skill.problemsSolved} solved</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                      style={{ width: `${(skill.problemsSolved / 200) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Languages */}
          <Card className="p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Code2 className="w-6 h-6 text-orange-500" />
              Languages Used
            </h2>
            
            <div className="space-y-4">
              {stats.languageStats.map((lang, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{lang.language}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{lang.problemsSolved} problems</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                        style={{ width: `${(lang.problemsSolved / stats.problemsSolved.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg">
              <p className="text-sm text-gray-900 dark:text-white text-center">
                <strong>Tip:</strong> Practicing in multiple languages improves your problem-solving skills!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

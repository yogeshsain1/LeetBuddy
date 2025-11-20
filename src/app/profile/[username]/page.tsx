"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LeetSocialLogo } from "@/components/LeetSocialLogo";
import {
  Code2,
  Trophy,
  Target,
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
import { motion } from "framer-motion";

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

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 600;
    const startTime = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const difficultyColors = {
    Easy: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
    Medium: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
    Hard: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-sky-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-cyan-500 to-blue-600 shadow ring-1 ring-cyan-300/40 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">LeetSocial</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="gap-2 hover:bg-cyan-50 dark:hover:bg-gray-800">
                <MessageCircle className="w-5 h-5" />Chat
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="hover:bg-cyan-50 dark:hover:bg-gray-800">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-24 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse [animation-delay:300ms]" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse [animation-delay:600ms]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <Card className="relative overflow-hidden p-8 mb-8 border border-sky-200/60 dark:border-cyan-900/50 bg-gradient-to-br from-indigo-600 via-cyan-600 to-blue-600 text-white shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
            <div className="flex flex-col md:flex-row items-center gap-8">
              <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} src={stats.avatar} alt={stats.username} className="w-32 h-32 rounded-full ring-4 ring-white/50 shadow-xl" />
              <div className="flex-1 text-center md:text-left relative">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
                    {stats.username}
                    <Crown className="w-7 h-7 text-yellow-300 drop-shadow" />
                  </h1>
                </div>
                <p className="text-cyan-100 text-lg mb-5">{stats.realName}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">Rank <AnimatedNumber value={stats.ranking} /></span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full">
                    <Flame className="w-5 h-5" />
                    <span className="font-semibold"><AnimatedNumber value={stats.streak.current} /> Day Streak</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold"><AnimatedNumber value={stats.reputation} /> Reputation</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="bg-white text-indigo-700 hover:bg-cyan-50 gap-2 shadow-inner">
                  <Share2 className="w-5 h-5" />Share
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="group relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-sky-200 dark:border-cyan-900">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-indigo-500/10 group-hover:via-cyan-500/10 group-hover:to-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Solved</h3>
              <Trophy className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2"><AnimatedNumber value={stats.problemsSolved.total} /></p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{stats.acceptanceRate}% acceptance</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-gray-500 dark:text-gray-400">
              <span>Easy {stats.problemsSolved.easy}</span>
              <span>Med {stats.problemsSolved.medium}</span>
              <span>Hard {stats.problemsSolved.hard}</span>
            </div>
          </Card>
          <Card className="group relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-sky-200 dark:border-cyan-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Contest Rating</h3>
              <BarChart3 className="w-5 h-5 text-cyan-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2"><AnimatedNumber value={stats.contestRating} /></p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Rank #{stats.contestRanking.toLocaleString()}</p>
          </Card>
          <Card className="group relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-sky-200 dark:border-cyan-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Global Ranking</h3>
              <GlobeIcon />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">#{stats.globalRanking.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Top {stats.topPercentage}%</p>
          </Card>
          <Card className="group relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-sky-200 dark:border-cyan-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Streak</h3>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2"><AnimatedNumber value={stats.streak.current} /></p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Longest {stats.streak.longest} days</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Easy Problems", value: stats.problemsSolved.easy, color: "from-emerald-400 to-teal-500", icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, max: 200 },
            { label: "Medium Problems", value: stats.problemsSolved.medium, color: "from-cyan-400 to-sky-500", icon: <Target className="w-5 h-5 text-cyan-600" />, max: 300 },
            { label: "Hard Problems", value: stats.problemsSolved.hard, color: "from-rose-500 to-pink-600", icon: <Zap className="w-5 h-5 text-rose-600" />, max: 100 },
          ].map((item, i) => (
            <Card key={i} className="p-6 bg-white dark:bg-gray-900 border border-sky-200/60 dark:border-cyan-900/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</h3>
                {item.icon}
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2"><AnimatedNumber value={item.value} /></p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${(item.value / item.max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} />
              </div>
            </Card>
          ))}
          <Card className="p-6 bg-white dark:bg-gray-900 border border-sky-200/60 dark:border-cyan-900/50 lg:col-span-2 flex flex-col justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><BarChart3 className="w-6 h-6 text-indigo-600" />Contest Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Rating", value: stats.contestRating },
                { label: "Contest Rank", value: `#${stats.contestRanking.toLocaleString()}` },
                { label: "Global Rank", value: `#${stats.globalRanking.toLocaleString()}` },
                { label: "Top %", value: stats.topPercentage + "%" },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-lg bg-sky-50/60 dark:bg-cyan-900/30 border border-sky-200/70 dark:border-cyan-800">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{c.label}</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{c.value}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 via-cyan-50 to-blue-50 dark:from-indigo-900/30 dark:via-cyan-900/30 dark:to-blue-900/30 border border-sky-200/60 dark:border-cyan-900">
              <div className="flex items-center gap-3">
                <Medal className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Participated in {stats.totalContests} contests</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Consistency boosts rating over time. Keep going!</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-900 border border-sky-200/60 dark:border-cyan-900">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><Flame className="w-6 h-6 text-orange-500" />Streak</h2>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 via-cyan-600 to-blue-600 shadow-inner">
                <div>
                  <p className="text-5xl font-bold text-white"><AnimatedNumber value={stats.streak.current} /></p>
                  <p className="text-xs text-cyan-100 tracking-wide">days</p>
                </div>
              </div>
              <p className="text-xs mt-3 text-gray-600 dark:text-gray-400">Current Streak</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Longest Streak", value: `${stats.streak.longest} days` },
                { label: "Contribution Points", value: stats.contributionPoints.toLocaleString() },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-sky-50/60 dark:bg-cyan-900/30">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-6 mb-10">
          <Card className="p-6 bg-white dark:bg-gray-900 border border-sky-200/60 dark:border-cyan-900">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><Award className="w-6 h-6 text-indigo-600" />Badges & Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.badges.map((b, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="relative p-4 rounded-lg border border-sky-200 dark:border-cyan-800 bg-gradient-to-br from-indigo-50 via-cyan-50 to-blue-50 dark:from-indigo-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.25),transparent_70%)]" />
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{b.name}</h3>
                  <p className="text-[11px] leading-snug text-gray-600 dark:text-gray-400">{b.description}</p>
                </motion.div>
              ))}
            </div>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-900 border border-sky-200/60 dark:border-cyan-900">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><Activity className="w-6 h-6 text-indigo-600" />Recent Submissions</h2>
            <div className="space-y-3">
              {stats.recentSubmissions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="p-4 rounded-lg bg-slate-50 dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{s.title}</h3>
                    <span className={`px-2 py-1 text-[10px] font-medium rounded ${difficultyColors[s.difficulty]}`}>{s.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      {s.status === "Accepted" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-rose-600" />}
                      <span className={s.status === "Accepted" ? "text-green-600" : "text-rose-600"}>{s.status}</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">{s.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white dark:bg-gray-900 border border-sky-200/60 dark:border-cyan-900">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><Target className="w-6 h-6 text-indigo-600" />Skills by Topic</h2>
            <div className="space-y-5">
              {stats.skills.map((skill, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.name}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{skill.problemsSolved} solved</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${(skill.problemsSolved / 200) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 * i }} className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 bg-white dark:bg-gray-900 border border-sky-200/60 dark:border-cyan-900">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><Code2 className="w-6 h-6 text-indigo-600" />Languages Used</h2>
            <div className="space-y-5">
              {stats.languageStats.map((lang, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{lang.language}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{lang.problemsSolved} problems</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${(lang.problemsSolved / stats.problemsSolved.total) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 * i }} className="h-2 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-indigo-50 via-cyan-50 to-blue-50 dark:from-indigo-900/30 dark:via-cyan-900/30 dark:to-blue-900/30 border border-sky-200/60 dark:border-cyan-900 text-center">
              <p className="text-xs text-gray-700 dark:text-gray-300"><strong>Tip:</strong> Multi-language practice amplifies pattern recognition.</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-cyan-600">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2c3 5 3 15 0 20" />
    </svg>
  );
}

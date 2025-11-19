"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  ArrowRight, 
  MessageCircle, 
  Users, 
  Code2, 
  Trophy,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Github,
  Brain,
  Target,
  Rocket
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">LeetSocial</span>
              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded">
                For LeetCoders
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/community" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition">
                Community
              </Link>
              <Link href="/activity" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition">
                Activity
              </Link>
              <Link href="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition">
                Leaderboard
              </Link>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline" className="rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600">
                  Join Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold">
                <Code2 className="w-4 h-4" />
                #1 LeetCode Community
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Where LeetCoders{" "}
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Connect & Grow
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Join the largest community of LeetCode enthusiasts. Chat in real-time, 
                discuss algorithms, share problem-solving strategies, and level up your 
                coding skills together. No video calls, no distractions—just pure coding conversations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-lg font-semibold shadow-xl hover:shadow-2xl transition-all group hover:from-orange-600 hover:to-yellow-600"
                  >
                    Start Chatting Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 px-8 rounded-full text-lg font-semibold border-2 dark:border-gray-700 dark:text-white group"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Join with LeetCode
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["Easy", "Medium", "Hard", "Expert"].map((level, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-950 flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-green-500 text-white" :
                          i === 1 ? "bg-yellow-500 text-white" :
                          i === 2 ? "bg-orange-500 text-white" :
                          "bg-red-500 text-white"
                        }`}
                        title={level}
                      >
                        {level[0]}
                      </div>
                    ))}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">50K+ Active Coders</p>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">All Levels Welcome</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chat Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                {/* Mock Chat Interface */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Two Sum Masters</h3>
                        <p className="text-xs text-orange-100">247 members online</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/20 rounded-full transition">
                        <Users className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 h-96 overflow-hidden bg-white dark:bg-gray-900">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Alex_Coder</span>
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded">Easy</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                        <p className="text-sm text-gray-900 dark:text-gray-100">Just solved Two Sum using HashMap! 🎉</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:30 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Sarah_LC</span>
                        <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded">Hard</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                        <p className="text-sm text-gray-900 dark:text-gray-100">Nice! Can you share your approach? 🤔</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:31 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                    <div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-900 dark:bg-gray-950 text-green-400 px-2 py-1 rounded text-xs mb-2">
                          O(n) time, O(n) space
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">Store complements in HashMap while iterating! 💡</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ml-11">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span>5 people are typing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Built for LeetCode Enthusiasts
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to discuss, learn, and master algorithms together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all hover:shadow-xl"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Join by Difficulty Level
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find your community and grow together
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {levels.map((level, index) => (
              <div key={index} className="relative">
                <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-4 ${level.borderColor} hover:scale-105 transition-transform cursor-pointer`}>
                  <div className={`w-16 h-16 ${level.bgColor} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6`}>
                    {level.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{level.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{level.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-500 dark:text-gray-400">{level.members} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-600 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-orange-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            100% Free Forever
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Start Your Coding Journey Today
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Join 50,000+ LeetCode enthusiasts already learning and growing together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:from-orange-600 hover:to-yellow-600"
              >
                Join Free Now
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-10 rounded-full text-lg font-semibold border-2 dark:border-gray-700 dark:text-white"
              >
                <Code2 className="w-5 h-5 mr-2" />
                Sign in with LeetCode
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">LeetSocial</span>
              </div>
              <p className="text-gray-400">
                Where LeetCode developers connect, learn, and grow together.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </div>
            </div>
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href="#" className="text-gray-400 hover:text-white transition">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LeetSocial. Built by developers, for developers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Real-Time Chat",
    description: "Discuss LeetCode problems instantly with fellow developers. Share solutions, ask questions, and learn together in real-time.",
    icon: <MessageCircle className="w-6 h-6 text-white" />,
  },
  {
    title: "Problem Discussions",
    description: "Dedicated channels for every difficulty level. From Easy to Hard, find the right community for your skill level.",
    icon: <MessageSquare className="w-6 h-6 text-white" />,
  },
  {
    title: "Code Sharing",
    description: "Share code snippets with syntax highlighting. Discuss algorithms, time complexity, and optimization strategies.",
    icon: <Code2 className="w-6 h-6 text-white" />,
  },
  {
    title: "Study Groups",
    description: "Join or create study groups focused on specific topics. DSA, Dynamic Programming, Graphs, and more.",
    icon: <Users className="w-6 h-6 text-white" />,
  },
  {
    title: "Interview Prep",
    description: "Connect with others preparing for FAANG interviews. Share experiences, tips, and mock interview sessions.",
    icon: <Target className="w-6 h-6 text-white" />,
  },
  {
    title: "Daily Challenges",
    description: "Discuss daily LeetCode challenges. Compare approaches and learn from different problem-solving techniques.",
    icon: <Trophy className="w-6 h-6 text-white" />,
  },
];

const levels = [
  {
    title: "Easy",
    description: "Just starting? Join beginners learning fundamentals.",
    icon: "🌱",
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
    members: "15K+",
  },
  {
    title: "Medium",
    description: "Ready for a challenge? Tackle intermediate problems.",
    icon: "🔥",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-500",
    members: "22K+",
  },
  {
    title: "Hard",
    description: "Master complex algorithms with expert developers.",
    icon: "⚡",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-500",
    members: "10K+",
  },
  {
    title: "Expert",
    description: "Compete at the highest level. Solve the toughest.",
    icon: "👑",
    bgColor: "bg-red-500",
    borderColor: "border-red-500",
    members: "3K+",
  },
];

const stats = [
  { value: "50K+", label: "Active Developers" },
  { value: "500K+", label: "Problems Discussed" },
  { value: "1M+", label: "Messages Daily" },
  { value: "24/7", label: "Community Support" },
];

const footerLinks = [
  {
    title: "Community",
    links: ["Easy Problems", "Medium Problems", "Hard Problems", "Study Groups"],
  },
  {
    title: "Resources",
    links: ["Algorithm Guide", "Interview Prep", "Code Templates", "Best Practices"],
  },
  {
    title: "Support",
    links: ["Help Center", "Discord", "GitHub", "Report Bug"],
  },
];
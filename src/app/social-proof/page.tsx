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
  Award,
  ThumbsUp,
  MessageSquare,
  Star,
  CheckCircle,
  Target,
  Zap,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Endorsement {
  id: string;
  topic: string;
  count: number;
  endorsedBy: string[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

interface Testimonial {
  id: string;
  from: {
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
}

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<"endorsements" | "testimonials" | "badges">(
    "endorsements"
  );

  const endorsements: Endorsement[] = [
    {
      id: "1",
      topic: "Dynamic Programming",
      count: 45,
      endorsedBy: ["sarah_codes", "mike_binary", "alex_algorithm"],
    },
    {
      id: "2",
      topic: "Graph Algorithms",
      count: 38,
      endorsedBy: ["david_tree", "graph_guru", "code_ninja_pro"],
    },
    {
      id: "3",
      topic: "Binary Trees",
      count: 32,
      endorsedBy: ["david_tree", "lisa_array", "emma_dev"],
    },
    {
      id: "4",
      topic: "Problem Solving",
      count: 56,
      endorsedBy: ["mike_binary", "sarah_codes", "alex_algorithm"],
    },
    {
      id: "5",
      topic: "Code Review",
      count: 28,
      endorsedBy: ["contest_king", "system_architect"],
    },
    {
      id: "6",
      topic: "Mentoring",
      count: 41,
      endorsedBy: ["emma_dev", "lisa_array", "sarah_codes"],
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: "1",
      from: {
        username: "sarah_codes",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=eab308",
      },
      text: "John is an excellent problem solver! He helped me understand dynamic programming concepts that I was struggling with for weeks. His explanations are clear and patient.",
      timestamp: "2 weeks ago",
      likes: 24,
    },
    {
      id: "2",
      from: {
        username: "mike_binary",
        avatar: "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=ef4444",
      },
      text: "Great mentor and collaborator. John's approach to breaking down complex problems is inspiring. Highly recommend pairing with him for challenging graph problems!",
      timestamp: "1 month ago",
      likes: 18,
    },
    {
      id: "3",
      from: {
        username: "emma_dev",
        avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=3b82f6",
      },
      text: "John has been incredibly helpful in our study group. His code reviews are thorough and constructive. Thanks to his feedback, I've improved my code quality significantly.",
      timestamp: "3 weeks ago",
      likes: 31,
    },
  ];

  const badges: Badge[] = [
    {
      id: "1",
      name: "100 Day Streak",
      icon: "🔥",
      description: "Solved problems for 100 consecutive days",
      rarity: "Epic",
    },
    {
      id: "2",
      name: "Graph Master",
      icon: "🕸️",
      description: "Solved 50 graph problems",
      rarity: "Rare",
    },
    {
      id: "3",
      name: "DP Expert",
      icon: "🧠",
      description: "Solved 50 dynamic programming problems",
      rarity: "Rare",
    },
    {
      id: "4",
      name: "Contest Winner",
      icon: "🏆",
      description: "Ranked in top 100 in a weekly contest",
      rarity: "Epic",
    },
    {
      id: "5",
      name: "Helpful Contributor",
      icon: "🤝",
      description: "Helped 25+ users with problem solutions",
      rarity: "Rare",
    },
    {
      id: "6",
      name: "Speed Demon",
      icon: "⚡",
      description: "Solved 10 problems in under 30 minutes",
      rarity: "Common",
    },
    {
      id: "7",
      name: "Code Reviewer",
      icon: "👁️",
      description: "Provided 50+ helpful code reviews",
      rarity: "Rare",
    },
    {
      id: "8",
      name: "Early Adopter",
      icon: "🚀",
      description: "Joined LeetSocial in beta",
      rarity: "Legendary",
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300";
      case "Rare":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300";
      case "Epic":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-300";
      case "Legendary":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-orange-600 dark:text-orange-400 border-yellow-300";
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
                <Button variant="ghost" className="gap-2 relative">
                  <MessageCircle className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>
              <Link href="/groups">
                <Button variant="ghost" className="gap-2">
                  <Users className="w-5 h-5" />
                  Groups
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
        {/* Profile Header */}
        <Card className="p-8 mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
          <div className="flex items-center gap-6">
            <img
              src="https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&size=128"
              alt="John Doe"
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">john_coder</h1>
              <p className="text-xl text-white/90 mb-4">Full Stack Developer • Problem Solving Enthusiast</p>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold">1089</p>
                  <p className="text-white/90 text-sm">Problems Solved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">203</p>
                  <p className="text-white/90 text-sm">Total Endorsements</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-white/90 text-sm">Badges Earned</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Proof Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Social Proof</h2>
          <Card className="p-4 bg-white dark:bg-gray-900">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("endorsements")}
                className={activeTab === "endorsements" ? "border-b-2 border-orange-500 rounded-none" : "rounded-none"}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Endorsements ({endorsements.length})
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("testimonials")}
                className={activeTab === "testimonials" ? "border-b-2 border-orange-500 rounded-none" : "rounded-none"}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Testimonials ({testimonials.length})
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("badges")}
                className={activeTab === "badges" ? "border-b-2 border-orange-500 rounded-none" : "rounded-none"}
              >
                <Award className="w-4 h-4 mr-2" />
                Badges ({badges.length})
              </Button>
            </div>

            {/* Endorsements Tab */}
            {activeTab === "endorsements" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Skills and topics endorsed by the community
                  </p>
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Endorse Skill
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {endorsements.map((endorsement) => (
                    <Card
                      key={endorsement.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {endorsement.topic}
                        </h3>
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-bold">
                          {endorsement.count}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Endorsed by:</span>
                        <div className="flex -space-x-2">
                          {endorsement.endorsedBy.slice(0, 3).map((user, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white font-bold"
                            >
                              {user[0].toUpperCase()}
                            </div>
                          ))}
                        </div>
                        {endorsement.count > 3 && (
                          <span className="text-xs">+{endorsement.count - 3} more</span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials Tab */}
            {activeTab === "testimonials" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    What others say about working with John
                  </p>
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write Testimonial
                  </Button>
                </div>
                {testimonials.map((testimonial) => (
                  <Card
                    key={testimonial.id}
                    className="p-6 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={testimonial.from.avatar}
                        alt={testimonial.from.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Link
                              href={`/profile/${testimonial.from.username}`}
                              className="font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                            >
                              {testimonial.from.username}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {testimonial.timestamp}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{testimonial.likes}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          "{testimonial.text}"
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === "badges" && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Achievements and milestones unlocked
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge) => (
                    <Card
                      key={badge.id}
                      className={`p-4 text-center border-2 ${getRarityColor(badge.rarity)} hover:scale-105 transition-transform`}
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {badge.description}
                      </p>
                      <span className="text-xs font-semibold uppercase">{badge.rarity}</span>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Mentor/Mentee Matching */}
        <Card className="p-6 bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Mentorship Program
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Find a Mentor</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Connect with experienced coders who can guide you through challenging topics and career advice.
              </p>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Browse Mentors
              </Button>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Become a Mentor</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Share your knowledge and help others grow. Build your reputation while giving back to the community.
              </p>
              <Button className="bg-green-600 text-white hover:bg-green-700">
                Start Mentoring
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

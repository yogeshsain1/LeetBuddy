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
  Trophy,
  TrendingUp,
  Search,
  Plus,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Hash,
  Crown,
  Star,
  MessageSquare,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  icon: string;
  memberCount: number;
  activeNow: number;
  isPrivate: boolean;
  isMember: boolean;
  owner: string;
  nextSession?: string;
  recentActivity: string;
  difficulty: "All" | "Easy" | "Medium" | "Hard" | "Mixed";
}

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "my-groups" | "popular">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");

  const groups: StudyGroup[] = [
    {
      id: "1",
      name: "Dynamic Programming Masters",
      description: "Deep dive into DP patterns, memoization, and optimization techniques",
      topic: "Dynamic Programming",
      icon: "🧠",
      memberCount: 1247,
      activeNow: 34,
      isPrivate: false,
      isMember: true,
      owner: "dp_master",
      nextSession: "Today at 6:00 PM",
      recentActivity: "5 minutes ago",
      difficulty: "Hard",
    },
    {
      id: "2",
      name: "Graph Algorithms Study Circle",
      description: "BFS, DFS, Dijkstra, and advanced graph theory problems",
      topic: "Graphs",
      icon: "🕸️",
      memberCount: 892,
      activeNow: 28,
      isPrivate: false,
      isMember: true,
      owner: "graph_guru",
      nextSession: "Tomorrow at 3:00 PM",
      recentActivity: "12 minutes ago",
      difficulty: "Hard",
    },
    {
      id: "3",
      name: "FAANG Interview Prep 2025",
      description: "Preparing for FAANG interviews with mock sessions and problem discussions",
      topic: "Interview Prep",
      icon: "💼",
      memberCount: 2156,
      activeNow: 67,
      isPrivate: false,
      isMember: false,
      owner: "code_ninja_pro",
      nextSession: "Today at 8:00 PM",
      recentActivity: "2 minutes ago",
      difficulty: "Mixed",
    },
    {
      id: "4",
      name: "Array & String Beginners",
      description: "Learn fundamentals of arrays, strings, and two-pointer techniques",
      topic: "Arrays",
      icon: "📊",
      memberCount: 3421,
      activeNow: 89,
      isPrivate: false,
      isMember: false,
      owner: "lisa_array",
      recentActivity: "1 hour ago",
      difficulty: "Easy",
    },
    {
      id: "5",
      name: "Binary Trees & BST Deep Dive",
      description: "Master tree traversals, BST operations, and complex tree problems",
      topic: "Trees",
      icon: "🌳",
      memberCount: 1567,
      activeNow: 45,
      isPrivate: false,
      isMember: true,
      owner: "david_tree",
      nextSession: "Friday at 7:00 PM",
      recentActivity: "30 minutes ago",
      difficulty: "Medium",
    },
    {
      id: "6",
      name: "Weekly Contest Warriors",
      description: "Live problem-solving during weekly contests with post-contest analysis",
      topic: "Contests",
      icon: "⚔️",
      memberCount: 987,
      activeNow: 12,
      isPrivate: false,
      isMember: false,
      owner: "contest_king",
      nextSession: "Sunday at 10:30 AM",
      recentActivity: "3 hours ago",
      difficulty: "Mixed",
    },
    {
      id: "7",
      name: "System Design Study Group",
      description: "Learn scalability, distributed systems, and architecture patterns",
      topic: "System Design",
      icon: "🏗️",
      memberCount: 1823,
      activeNow: 56,
      isPrivate: true,
      isMember: true,
      owner: "system_architect",
      nextSession: "Wednesday at 5:00 PM",
      recentActivity: "45 minutes ago",
      difficulty: "Hard",
    },
    {
      id: "8",
      name: "SQL & Database Problems",
      description: "Practice SQL queries, database design, and optimization",
      topic: "SQL",
      icon: "🗄️",
      memberCount: 654,
      activeNow: 18,
      isPrivate: false,
      isMember: false,
      owner: "database_expert",
      recentActivity: "2 hours ago",
      difficulty: "Medium",
    },
  ];

  const topics = ["all", "Dynamic Programming", "Graphs", "Trees", "Arrays", "Interview Prep", "Contests", "System Design", "SQL"];

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTopic = topicFilter === "all" || group.topic === topicFilter;

    if (filter === "my-groups") return matchesSearch && matchesTopic && group.isMember;
    if (filter === "popular") return matchesSearch && matchesTopic && group.memberCount > 1000;
    return matchesSearch && matchesTopic;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "Hard":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      case "Mixed":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Study Groups & Rooms
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join topic-based groups and collaborate with other LeetCoders
            </p>
          </div>
          <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
            <Plus className="w-5 h-5" />
            Create Group
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white dark:bg-gray-900 text-center">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{groups.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Groups</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-gray-900 text-center">
            <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {groups.filter((g) => g.isMember).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your Groups</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-gray-900 text-center">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {groups.reduce((sum, g) => sum + g.activeNow, 0)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Now</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-gray-900 text-center">
            <Video className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {groups.filter((g) => g.nextSession).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Live Sessions Today</p>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="p-6 mb-6 bg-white dark:bg-gray-900">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups by name, topic, or description..."
                className="pl-11"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={
                    filter === "all" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  All Groups
                </Button>
                <Button
                  variant={filter === "my-groups" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("my-groups")}
                  className={
                    filter === "my-groups" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  My Groups
                </Button>
                <Button
                  variant={filter === "popular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("popular")}
                  className={
                    filter === "popular" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""
                  }
                >
                  Popular
                </Button>
              </div>

              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic === "all" ? "All Topics" : topic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="p-6 bg-white dark:bg-gray-900 hover:shadow-xl transition-all border-2 border-gray-100 dark:border-gray-800 hover:border-orange-500 dark:hover:border-orange-500"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{group.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        {group.topic}
                      </p>
                    </div>
                    {group.isPrivate ? (
                      <Lock className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Unlock className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {group.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getDifficultyColor(group.difficulty)}`}>
                      {group.difficulty}
                    </span>
                    {group.isMember && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        Member
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>
                    {group.memberCount.toLocaleString()} members • {group.activeNow} active now
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Crown className="w-4 h-4" />
                  <span>Created by {group.owner}</span>
                </div>
                {group.nextSession && (
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                    <Calendar className="w-4 h-4" />
                    <span>Next session: {group.nextSession}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Active {group.recentActivity}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {group.isMember ? (
                  <>
                    <Button className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Open Chat
                    </Button>
                    <Button variant="outline">Leave</Button>
                  </>
                ) : (
                  <>
                    <Button className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Join Group
                    </Button>
                    <Button variant="outline">Preview</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <Card className="p-12 text-center bg-white dark:bg-gray-900">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No groups found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters
            </p>
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
              <Plus className="w-5 h-5" />
              Create Your Own Group
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

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
  Settings,
  User,
  Lock,
  Eye,
  Mail,
  Smartphone,
  Shield,
  Trash2,
  Link as LinkIcon,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "privacy" | "notifications" | "account">(
    "profile"
  );

  const [profileSettings, setProfileSettings] = useState({
    realName: "John Doe",
    bio: "Full Stack Developer • Problem Solving Enthusiast",
    location: "San Francisco, CA",
    company: "Tech Corp",
    website: "https://johndoe.dev",
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showOnlineStatus: true,
    showActivity: true,
    allowFriendRequests: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    friendRequests: true,
    messages: true,
    achievements: true,
    contests: false,
    profileViews: true,
    mentions: true,
    groupInvites: true,
    weeklyDigest: true,
  });

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage your account preferences and privacy
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-white dark:bg-gray-900">
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("profile")}
                  className={`w-full justify-start gap-2 ${
                    activeTab === "profile" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : ""
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile Settings
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("privacy")}
                  className={`w-full justify-start gap-2 ${
                    activeTab === "privacy" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : ""
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full justify-start gap-2 ${
                    activeTab === "notifications" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : ""
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("account")}
                  className={`w-full justify-start gap-2 ${
                    activeTab === "account" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : ""
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Account
                </Button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <Card className="p-6 bg-white dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <img
                        src="https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&size=80"
                        alt="Profile"
                        className="w-20 h-20 rounded-full"
                      />
                      <div>
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white mr-2">
                          Upload New Photo
                        </Button>
                        <Button size="sm" variant="outline">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Real Name
                    </label>
                    <Input
                      value={profileSettings.realName}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, realName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileSettings.bio}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, bio: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <Input
                        value={profileSettings.location}
                        onChange={(e) =>
                          setProfileSettings({ ...profileSettings, location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Company
                      </label>
                      <Input
                        value={profileSettings.company}
                        onChange={(e) =>
                          setProfileSettings({ ...profileSettings, company: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <Input
                      value={profileSettings.website}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, website: e.target.value })
                      }
                      placeholder="https://"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      LeetCode Username
                    </label>
                    <div className="flex gap-2">
                      <Input value="john_coder" disabled className="flex-1" />
                      <Button variant="outline">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Reconnect
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Privacy & Security */}
            {activeTab === "privacy" && (
              <Card className="p-6 bg-white dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Privacy & Security
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) =>
                        setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="public">Public - Anyone can view</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Show Email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Display your email on your profile
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showEmail}
                          onChange={(e) =>
                            setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Show Online Status
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Let others see when you're online
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showOnlineStatus}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              showOnlineStatus: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Show Activity Feed
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Share your solved problems with others
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showActivity}
                          onChange={(e) =>
                            setPrivacySettings({ ...privacySettings, showActivity: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Allow Friend Requests
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Others can send you friend requests
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowFriendRequests}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              allowFriendRequests: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <Card className="p-6 bg-white dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-4">
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Account */}
            {activeTab === "account" && (
              <Card className="p-6 bg-white dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Account Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-3">
                      <Input type="password" placeholder="Current Password" />
                      <Input type="password" placeholder="New Password" />
                      <Input type="password" placeholder="Confirm New Password" />
                      <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Change Email
                    </h3>
                    <div className="space-y-3">
                      <Input
                        type="email"
                        placeholder="New Email Address"
                        defaultValue="john@example.com"
                      />
                      <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                        Update Email
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                      Danger Zone
                    </h3>
                    <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    </Card>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

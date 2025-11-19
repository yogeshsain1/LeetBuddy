"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useFriendRequests, useFriends } from "@/hooks/use-friend-requests";
import { useUserSearch } from "@/hooks/use-user-search";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Search,
  Users,
  UserPlus,
  UserMinus,
  MessageCircle,
  Check,
  X,
  Clock,
  UserCheck,
  Bell,
  Trophy,
  TrendingUp,
  Loader2,
  UserX,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "suggestions">("all");
  
  const { requests, loading: requestsLoading, acceptRequest, rejectRequest, cancelRequest, sendRequest } = useFriendRequests();
  const { friends, loading: friendsLoading, removeFriend } = useFriends();
  const { results: searchResults, loading: searchLoading, searchUsers, clearSearch } = useUserSearch();

  const handleAcceptRequest = async (requestId: number, username: string) => {
    const result = await acceptRequest(requestId);
    if (result.success) {
      toast.success(`✓ You are now friends with ${username}!`);
    } else {
      toast.error(result.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    const result = await rejectRequest(requestId);
    if (result.success) {
      toast.success('Friend request rejected');
    } else {
      toast.error(result.error || 'Failed to reject request');
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    const result = await cancelRequest(requestId);
    if (result.success) {
      toast.success('Friend request cancelled');
    } else {
      toast.error(result.error || 'Failed to cancel request');
    }
  };

  const handleRemoveFriend = async (friendId: number, username: string) => {
    if (confirm(`Are you sure you want to remove ${username} from your friends?`)) {
      const result = await removeFriend(friendId);
      if (result.success) {
        toast.success(`Removed ${username} from friends`);
      } else {
        toast.error(result.error || 'Failed to remove friend');
      }
    }
  };

  const handleSendRequest = async (addresseeId: number, username: string) => {
    const result = await sendRequest(addresseeId);
    if (result.success) {
      toast.success(`Friend request sent to ${username}!`);
      // Refresh search results to update button state
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    } else {
      toast.error(result.error || 'Failed to send request');
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers(searchQuery);
      } else {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers, clearSearch]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.friend.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show search results when searching in suggestions tab or when search has results
  const showSearchResults = activeTab === "suggestions" && searchQuery.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
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
                <Button variant="default" className="gap-2 bg-gradient-to-r from-orange-500 to-yellow-500">
                  <UserCheck className="w-5 h-5" />
                  Friends
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" className="gap-2 relative">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {requests.total > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {requests.total}
                    </span>
                  )}
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Friends</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your friends and connect with other LeetCode enthusiasts
          </p>
        </div>

        {/* Search and Tabs */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="pl-11"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
              className={activeTab === "all" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}
            >
              <Users className="w-4 h-4 mr-2" />
              All Friends ({friends.length})
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "outline"}
              onClick={() => setActiveTab("pending")}
              className={activeTab === "pending" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending ({requests.total})
            </Button>
            <Button
              variant={activeTab === "suggestions" ? "default" : "outline"}
              onClick={() => setActiveTab("suggestions")}
              className={activeTab === "suggestions" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Suggestions
            </Button>
          </div>
        </div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === "all" && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {friendsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'No friends found' : 'No friends yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Start connecting with other developers!'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setActiveTab("suggestions")}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find Friends
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends.map((friendship) => (
                    <motion.div
                      key={friendship.friendshipId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                          <img
                            src={
                              friendship.friend.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(friendship.friend.username)}&background=random`
                            }
                            alt={friendship.friend.username}
                            className="w-16 h-16 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/profile/${friendship.friend.username}`}
                              className="font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                            >
                              {friendship.friend.username}
                            </Link>
                            {friendship.friend.fullName && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {friendship.friend.fullName}
                              </p>
                            )}
                            {friendship.friend.location && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                📍 {friendship.friend.location}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              Friends since {new Date(friendship.since).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Link href="/messages" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFriend(friendship.friend.id, friendship.friend.username)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {requestsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <>
                  {/* Received Requests */}
                  {requests.received.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Received Requests ({requests.received.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {requests.received.map((request) => (
                          <Card key={request.id} className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <img
                                src={
                                  request.requester?.avatarUrl ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester?.username || 'User')}&background=random`
                                }
                                alt={request.requester?.username}
                                className="w-16 h-16 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/profile/${request.requester?.username}`}
                                  className="font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                                >
                                  {request.requester?.username}
                                </Link>
                                {request.requester?.fullName && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {request.requester?.fullName}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {new Date(request.requestedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptRequest(request.id, request.requester?.username || 'User')}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                                className="flex-1"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sent Requests */}
                  {requests.sent.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Sent Requests ({requests.sent.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {requests.sent.map((request) => (
                          <Card key={request.id} className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <img
                                src={
                                  request.addressee?.avatarUrl ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(request.addressee?.username || 'User')}&background=random`
                                }
                                alt={request.addressee?.username}
                                className="w-16 h-16 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/profile/${request.addressee?.username}`}
                                  className="font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                                >
                                  {request.addressee?.username}
                                </Link>
                                {request.addressee?.fullName && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {request.addressee?.fullName}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelRequest(request.id)}
                              className="w-full"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel Request
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {requests.total === 0 && (
                    <Card className="p-12 text-center">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No pending requests
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        You don't have any pending friend requests
                      </p>
                    </Card>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === "suggestions" && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {showSearchResults ? (
                searchLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Search Results ({searchResults.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((user) => (
                        <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start gap-4 mb-4">
                            <img
                              src={
                                user.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`
                              }
                              alt={user.username}
                              className="w-16 h-16 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/profile/${user.username}`}
                                className="font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                              >
                                {user.username}
                              </Link>
                              {user.fullName && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {user.fullName}
                                </p>
                              )}
                              {user.location && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  📍 {user.location}
                                </p>
                              )}
                              {user.leetcodeUsername && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                  🏆 {user.leetcodeUsername}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {user.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {user.bio}
                            </p>
                          )}

                          <div className="flex gap-2">
                            {user.friendshipStatus === 'none' && (
                              <Button
                                size="sm"
                                onClick={() => handleSendRequest(user.id, user.username)}
                                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500"
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Friend
                              </Button>
                            )}
                            {user.friendshipStatus === 'friends' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="w-full"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Friends
                              </Button>
                            )}
                            {user.friendshipStatus === 'request_sent' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="w-full"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Request Sent
                              </Button>
                            )}
                            {user.friendshipStatus === 'request_received' && (
                              <div className="flex gap-2 w-full">
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptRequest(user.friendshipId!, user.username)}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectRequest(user.friendshipId!)}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No users found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try searching with a different username
                    </p>
                  </Card>
                )
              ) : (
                <Card className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Find Friends
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Search for users by their username to connect with them
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    💡 Tip: Type at least 2 characters in the search box above
                  </p>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

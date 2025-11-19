import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface Friend {
  id: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  friendsSince: string;
}

interface PendingRequest {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: string;
  createdAt: string;
  requester: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl?: string;
    bio?: string;
  };
}

/**
 * Hook to fetch user's friends
 */
export function useFriends() {
  const { user } = useAuth();

  return useQuery<Friend[]>({
    queryKey: ["friends", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/friends?action=friends");
      if (!response.ok) {
        throw new Error("Failed to fetch friends");
      }
      const data = await response.json();
      return data.data.friends;
    },
    enabled: !!user,
  });
}

/**
 * Hook to fetch pending friend requests
 */
export function usePendingRequests() {
  const { user } = useAuth();

  return useQuery<PendingRequest[]>({
    queryKey: ["pending-requests", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/friends?action=pending");
      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }
      const data = await response.json();
      return data.data.pending;
    },
    enabled: !!user,
  });
}

/**
 * Hook to send a friend request
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to send friend request");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate friends query to refetch
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

/**
 * Hook to accept a friend request
 */
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: number) => {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", friendshipId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to accept friend request");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both friends and pending requests
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
    },
  });
}

/**
 * Hook to reject a friend request
 */
export function useRejectFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: number) => {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", friendshipId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to reject friend request");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate pending requests query
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
    },
  });
}

/**
 * Hook to remove a friend
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to remove friend");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate friends query
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

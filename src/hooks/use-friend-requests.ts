'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FriendRequest {
  id: number;
  type?: 'sent' | 'received';
  status: string;
  requestedAt: string;
  respondedAt: string | null;
  requester?: {
    id: number;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    leetcodeUsername: string | null;
  };
  addressee?: {
    id: number;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    leetcodeUsername: string | null;
  };
  user?: {
    id: number;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    leetcodeUsername: string | null;
  };
}

export interface Friend {
  friendshipId: number;
  friend: {
    id: number;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    leetcodeUsername: string | null;
    location: string | null;
  };
  since: string;
}

export function useFriendRequests() {
  const [requests, setRequests] = useState<{
    received: FriendRequest[];
    sent: FriendRequest[];
    total: number;
  }>({ received: [], sent: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friend-requests?type=all');
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch friend requests');
      }
    } catch (err) {
      setError('Failed to fetch friend requests');
      console.error('Error fetching friend requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const sendRequest = useCallback(async (addresseeId: number) => {
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresseeId }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchRequests();
        return { success: true, message: result.data.message };
      } else {
        return { success: false, error: result.error?.message || 'Failed to send request' };
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      return { success: false, error: 'Failed to send request' };
    }
  }, [fetchRequests]);

  const acceptRequest = useCallback(async (requestId: number) => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchRequests();
        return { success: true, message: result.data.message };
      } else {
        return { success: false, error: result.error?.message || 'Failed to accept request' };
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      return { success: false, error: 'Failed to accept request' };
    }
  }, [fetchRequests]);

  const rejectRequest = useCallback(async (requestId: number) => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchRequests();
        return { success: true, message: result.data.message };
      } else {
        return { success: false, error: result.error?.message || 'Failed to reject request' };
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      return { success: false, error: 'Failed to reject request' };
    }
  }, [fetchRequests]);

  const cancelRequest = useCallback(async (requestId: number) => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchRequests();
        return { success: true, message: result.data.message };
      } else {
        return { success: false, error: result.error?.message || 'Failed to cancel request' };
      }
    } catch (err) {
      console.error('Error cancelling friend request:', err);
      return { success: false, error: 'Failed to cancel request' };
    }
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    refresh: fetchRequests,
  };
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friends');
      const result = await response.json();

      if (result.success) {
        setFriends(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch friends');
      }
    } catch (err) {
      setError('Failed to fetch friends');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const removeFriend = useCallback(async (friendId: number) => {
    try {
      const response = await fetch(`/api/friends?friendId=${friendId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchFriends();
        return { success: true, message: result.data.message };
      } else {
        return { success: false, error: result.error?.message || 'Failed to remove friend' };
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      return { success: false, error: 'Failed to remove friend' };
    }
  }, [fetchFriends]);

  return {
    friends,
    loading,
    error,
    removeFriend,
    refresh: fetchFriends,
  };
}

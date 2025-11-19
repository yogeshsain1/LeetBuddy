'use client';

import { useState, useCallback } from 'react';

export interface SearchedUser {
  id: number;
  username: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  leetcodeUsername: string | null;
  friendshipStatus: 'none' | 'friends' | 'request_sent' | 'request_received' | 'rejected' | 'blocked';
  friendshipId: number | null;
  isRequester: boolean;
}

export function useUserSearch() {
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuery(searchQuery);

      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();

      if (result.success) {
        setResults(result.data.users);
      } else {
        setError(result.error?.message || 'Failed to search users');
        setResults([]);
      }
    } catch (err) {
      setError('Failed to search users');
      setResults([]);
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
    setQuery('');
  }, []);

  return {
    results,
    loading,
    error,
    query,
    searchUsers,
    clearSearch,
  };
}

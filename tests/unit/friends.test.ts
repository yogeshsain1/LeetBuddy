import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getUserFriends,
  areFriends,
} from '@/lib/friends';
import { db } from '@/db';

// Mock the database
vi.mock('@/db', () => {
  const mockWhere = vi.fn().mockResolvedValue([]);
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });
  
  const mockValues = vi.fn().mockResolvedValue([{ id: 1 }]);
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });
  
  const mockUpdateWhere = vi.fn().mockResolvedValue([]);
  const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });
  
  const mockDeleteWhere = vi.fn().mockResolvedValue([]);
  const mockDelete = vi.fn().mockReturnValue({ where: mockDeleteWhere });
  
  return {
    db: {
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    },
  };
});

describe('Friends System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request', async () => {
      const requesterId = 1;
      const addresseeId = 2;

      await expect(
        sendFriendRequest(requesterId, addresseeId)
      ).resolves.not.toThrow();
    });

    it('should throw error when sending request to self', async () => {
      const userId = 1;

      await expect(sendFriendRequest(userId, userId)).rejects.toThrow(
        "You can't send a friend request to yourself"
      );
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept a friend request', async () => {
      const friendshipId = 1;
      const addresseeId = 2;

      await expect(
        acceptFriendRequest(friendshipId, addresseeId)
      ).resolves.not.toThrow();
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject a friend request', async () => {
      const friendshipId = 1;
      const addresseeId = 2;

      await expect(
        rejectFriendRequest(friendshipId, addresseeId)
      ).resolves.not.toThrow();
    });
  });

  describe('removeFriend', () => {
    it('should remove a friend', async () => {
      const userId = 1;
      const friendId = 2;

      await expect(removeFriend(userId, friendId)).resolves.not.toThrow();
    });
  });
});

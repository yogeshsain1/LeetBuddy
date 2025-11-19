import { db } from "@/db";
import { friendships } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

/**
 * Check if two users are friends
 */
export async function areFriends(userId1: number, userId2: number): Promise<boolean> {
  const friendship = await db
    .select()
    .from(friendships)
    .where(
      and(
        or(
          and(eq(friendships.requesterId, userId1), eq(friendships.addresseeId, userId2)),
          and(eq(friendships.requesterId, userId2), eq(friendships.addresseeId, userId1))
        ),
        eq(friendships.status, "accepted")
      )
    )
    .limit(1);

  return friendship.length > 0;
}

/**
 * Get all friends of a user
 */
export async function getUserFriends(userId: number) {
  const friendshipsData = await db
    .select()
    .from(friendships)
    .where(
      and(
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
        eq(friendships.status, "accepted")
      )
    );

  return friendshipsData.map((f) => ({
    friendId: f.requesterId === userId ? f.addresseeId : f.requesterId,
    since: f.respondedAt || f.createdAt,
  }));
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(requesterId: number, addresseeId: number) {
  const existingFriendship = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
        and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId))
      )
    )
    .limit(1);

  if (existingFriendship.length > 0) {
    throw new Error("Friend request already exists or you are already friends");
  }

  const now = new Date().toISOString();
  return await db.insert(friendships).values({
    requesterId,
    addresseeId,
    status: "pending",
    requestedAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(friendshipId: number, addresseeId: number) {
  const now = new Date().toISOString();
  return await db
    .update(friendships)
    .set({
      status: "accepted",
      respondedAt: now,
      updatedAt: now,
    })
    .where(and(eq(friendships.id, friendshipId), eq(friendships.addresseeId, addresseeId)));
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(friendshipId: number, addresseeId: number) {
  const now = new Date().toISOString();
  return await db
    .update(friendships)
    .set({
      status: "rejected",
      respondedAt: now,
      updatedAt: now,
    })
    .where(and(eq(friendships.id, friendshipId), eq(friendships.addresseeId, addresseeId)));
}

/**
 * Get pending friend requests for a user
 */
export async function getPendingFriendRequests(userId: number) {
  return await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, "pending")));
}

/**
 * Remove a friend
 */
export async function removeFriend(userId: number, friendId: number) {
  return await db
    .delete(friendships)
    .where(
      and(
        or(
          and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, friendId)),
          and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, userId))
        ),
        eq(friendships.status, "accepted")
      )
    );
}

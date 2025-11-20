import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { friendships } from '@/db/schema';
import { eq, like, or, and, ne } from 'drizzle-orm';

// Search for users by username or full name
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = '1'; // Placeholder (should be a string UUID)

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_QUERY', message: 'Search query must be at least 2 characters' } },
        { status: 400 }
      );
    }

    const searchTerm = `%${query.trim()}%`;

    // Search for users by username, full name, or LeetCode username
    const searchResults = await db
      .select({
        id: user.id,
        username: user.username,
        fullName: user.name,
        bio: user.bio,
        avatarUrl: user.image,
        location: user.location,
        leetcodeUsername: user.leetcodeUsername,
      })
      .from(user)
      .where(
        or(
          like(user.username, searchTerm),
          like(user.name, searchTerm),
          like(user.leetcodeUsername, searchTerm)
        )
      )
      .limit(limit);

    // Get friendship status for each user
    const usersWithStatus = await Promise.all(
      searchResults.map(async (user) => {
        // Check if there's any friendship between current user and searched user
        const [friendship] = await db
          .select()
          .from(friendships)
          .where(
            or(
              and(
                eq(friendships.requesterId, String(userId)),
                eq(friendships.addresseeId, String(user.id))
              ),
              and(
                eq(friendships.requesterId, String(user.id)),
                eq(friendships.addresseeId, String(userId))
              )
            )
          )
          .limit(1);

        let friendshipStatus = 'none';
        let friendshipId = null;
        let isRequester = false;

        if (friendship) {
          friendshipId = friendship.id;
          isRequester = String(friendship.requesterId) === String(userId);

          if (friendship.status === 'accepted') {
            friendshipStatus = 'friends';
          } else if (friendship.status === 'pending') {
            friendshipStatus = isRequester ? 'request_sent' : 'request_received';
          } else if (friendship.status === 'rejected') {
            friendshipStatus = 'rejected';
          } else if (friendship.status === 'blocked') {
            friendshipStatus = 'blocked';
          }
        }

        return {
          ...user,
          friendshipStatus,
          friendshipId,
          isRequester,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStatus,
        total: usersWithStatus.length,
        query: query.trim(),
      }
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SEARCH_ERROR', message: 'Failed to search users' } },
      { status: 500 }
    );
  }
}

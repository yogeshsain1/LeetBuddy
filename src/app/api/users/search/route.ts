import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, friendships } from '@/db/schema';
import { eq, like, or, and, ne } from 'drizzle-orm';

// Search for users by username or full name
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = 1; // Placeholder

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

    // Search for users by username or full name (exclude current user)
    const searchResults = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
        location: users.location,
        leetcodeUsername: users.leetcodeUsername,
      })
      .from(users)
      .where(
        and(
          ne(users.id, userId),
          or(
            like(users.username, searchTerm),
            like(users.fullName, searchTerm)
          )
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
                eq(friendships.requesterId, userId),
                eq(friendships.addresseeId, user.id)
              ),
              and(
                eq(friendships.requesterId, user.id),
                eq(friendships.addresseeId, userId)
              )
            )
          )
          .limit(1);

        let friendshipStatus = 'none';
        let friendshipId = null;
        let isRequester = false;

        if (friendship) {
          friendshipId = friendship.id;
          isRequester = friendship.requesterId === userId;

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

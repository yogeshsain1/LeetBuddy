import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { friendships, users } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

// Send a friend request
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = 1; // Placeholder

    const body = await request.json();
    const { addresseeId } = body;

    if (!addresseeId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_ADDRESSEE', message: 'Addressee ID is required' } },
        { status: 400 }
      );
    }

    if (userId === addresseeId) {
      return NextResponse.json(
        { success: false, error: { code: 'SELF_REQUEST', message: 'Cannot send friend request to yourself' } },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    const existingFriendship = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(
            eq(friendships.requesterId, userId),
            eq(friendships.addresseeId, addresseeId)
          ),
          and(
            eq(friendships.requesterId, addresseeId),
            eq(friendships.addresseeId, userId)
          )
        )
      )
      .limit(1);

    if (existingFriendship.length > 0) {
      const status = existingFriendship[0].status;
      if (status === 'accepted') {
        return NextResponse.json(
          { success: false, error: { code: 'ALREADY_FRIENDS', message: 'Already friends with this user' } },
          { status: 400 }
        );
      } else if (status === 'pending') {
        return NextResponse.json(
          { success: false, error: { code: 'REQUEST_PENDING', message: 'Friend request already pending' } },
          { status: 400 }
        );
      } else if (status === 'blocked') {
        return NextResponse.json(
          { success: false, error: { code: 'USER_BLOCKED', message: 'Cannot send friend request' } },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    // Create friend request
    const [newFriendship] = await db
      .insert(friendships)
      .values({
        requesterId: userId,
        addresseeId,
        status: 'pending',
        requestedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        friendshipId: newFriendship.id,
        status: 'pending',
        message: 'Friend request sent successfully'
      }
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SEND_ERROR', message: 'Failed to send friend request' } },
      { status: 500 }
    );
  }
}

// Get all friend requests (sent and received)
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = 1; // Placeholder

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'sent', 'received', 'all'

    let friendRequests;

    if (type === 'received') {
      // Friend requests received by the user (pending)
      const rawRequests = await db
        .select({
          id: friendships.id,
          status: friendships.status,
          requestedAt: friendships.requestedAt,
          respondedAt: friendships.respondedAt,
          requesterId: friendships.requesterId,
          userId: users.id,
          username: users.username,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          leetcodeUsername: users.leetcodeUsername,
        })
        .from(friendships)
        .innerJoin(users, eq(users.id, friendships.requesterId))
        .where(
          and(
            eq(friendships.addresseeId, userId),
            eq(friendships.status, 'pending')
          )
        )
        .orderBy(desc(friendships.requestedAt));

      friendRequests = rawRequests.map((req) => ({
        id: req.id,
        status: req.status,
        requestedAt: req.requestedAt,
        respondedAt: req.respondedAt,
        requester: {
          id: req.userId,
          username: req.username,
          fullName: req.fullName,
          avatarUrl: req.avatarUrl,
          leetcodeUsername: req.leetcodeUsername,
        }
      }));

    } else if (type === 'sent') {
      // Friend requests sent by the user (pending)
      const rawRequests = await db
        .select({
          id: friendships.id,
          status: friendships.status,
          requestedAt: friendships.requestedAt,
          respondedAt: friendships.respondedAt,
          addresseeId: friendships.addresseeId,
          userId: users.id,
          username: users.username,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          leetcodeUsername: users.leetcodeUsername,
        })
        .from(friendships)
        .innerJoin(users, eq(users.id, friendships.addresseeId))
        .where(
          and(
            eq(friendships.requesterId, userId),
            eq(friendships.status, 'pending')
          )
        )
        .orderBy(desc(friendships.requestedAt));

      friendRequests = rawRequests.map((req) => ({
        id: req.id,
        status: req.status,
        requestedAt: req.requestedAt,
        respondedAt: req.respondedAt,
        addressee: {
          id: req.userId,
          username: req.username,
          fullName: req.fullName,
          avatarUrl: req.avatarUrl,
          leetcodeUsername: req.leetcodeUsername,
        }
      }));

    } else {
      // All friend requests (sent and received)
      const rawReceived = await db
        .select({
          id: friendships.id,
          status: friendships.status,
          requestedAt: friendships.requestedAt,
          respondedAt: friendships.respondedAt,
          userId: users.id,
          username: users.username,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          leetcodeUsername: users.leetcodeUsername,
        })
        .from(friendships)
        .innerJoin(users, eq(users.id, friendships.requesterId))
        .where(
          and(
            eq(friendships.addresseeId, userId),
            eq(friendships.status, 'pending')
          )
        );

      const received = rawReceived.map((req) => ({
        id: req.id,
        type: 'received' as const,
        status: req.status,
        requestedAt: req.requestedAt,
        respondedAt: req.respondedAt,
        user: {
          id: req.userId,
          username: req.username,
          fullName: req.fullName,
          avatarUrl: req.avatarUrl,
          leetcodeUsername: req.leetcodeUsername,
        }
      }));

      const rawSent = await db
        .select({
          id: friendships.id,
          status: friendships.status,
          requestedAt: friendships.requestedAt,
          respondedAt: friendships.respondedAt,
          userId: users.id,
          username: users.username,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          leetcodeUsername: users.leetcodeUsername,
        })
        .from(friendships)
        .innerJoin(users, eq(users.id, friendships.addresseeId))
        .where(
          and(
            eq(friendships.requesterId, userId),
            eq(friendships.status, 'pending')
          )
        );

      const sent = rawSent.map((req) => ({
        id: req.id,
        type: 'sent' as const,
        status: req.status,
        requestedAt: req.requestedAt,
        respondedAt: req.respondedAt,
        user: {
          id: req.userId,
          username: req.username,
          fullName: req.fullName,
          avatarUrl: req.avatarUrl,
          leetcodeUsername: req.leetcodeUsername,
        }
      }));

      return NextResponse.json({
        success: true,
        data: {
          received,
          sent,
          total: received.length + sent.length
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: friendRequests
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch friend requests' } },
      { status: 500 }
    );
  }
}

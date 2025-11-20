import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { friendships } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Accept or reject friend request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = '1'; // Placeholder (should be a string UUID)

    const friendshipId = parseInt(params.id); // PK is still number
    const body = await request.json();
    const { action } = body; // 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ACTION', message: 'Action must be "accept" or "reject"' } },
        { status: 400 }
      );
    }

    // Get the friendship
    const [friendship] = await db
      .select()
      .from(friendships)
      .where(eq(friendships.id, friendshipId))
      .limit(1);

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Friend request not found' } },
        { status: 404 }
      );
    }

    // Verify user is the addressee
    if (String(friendship.addresseeId) !== String(userId)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized to respond to this request' } },
        { status: 403 }
      );
    }

    // Check if already responded
    if (friendship.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_RESPONDED', message: `Friend request already ${friendship.status}` } },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    // Update friendship status
    const [updatedFriendship] = await db
      .update(friendships)
      .set({
        status: newStatus,
        respondedAt: now,
        updatedAt: now,
      })
      .where(eq(friendships.id, friendshipId))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        friendshipId: updatedFriendship.id,
        status: updatedFriendship.status,
        message: `Friend request ${action}ed successfully`
      }
    });
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to respond to friend request' } },
      { status: 500 }
    );
  }
}

// Cancel/delete friend request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = '1'; // Placeholder (should be a string UUID)

    const friendshipId = parseInt(params.id); // PK is still number

    // Get the friendship
    const [friendship] = await db
      .select()
      .from(friendships)
      .where(eq(friendships.id, friendshipId))
      .limit(1);

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Friend request not found' } },
        { status: 404 }
      );
    }

    // Verify user is the requester (can only cancel own requests)
    if (String(friendship.requesterId) !== String(userId)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized to cancel this request' } },
        { status: 403 }
      );
    }

    // Can only cancel pending requests
    if (friendship.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: { code: 'CANNOT_CANCEL', message: `Cannot cancel ${friendship.status} request` } },
        { status: 400 }
      );
    }

    // Delete the friend request
    await db
      .delete(friendships)
      .where(eq(friendships.id, friendshipId));

    return NextResponse.json({
      success: true,
      data: {
        message: 'Friend request cancelled successfully'
      }
    });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to cancel friend request' } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageRooms, roomMembers, roomMessages } from '@/db/schema/messages';
import { users } from '@/db/schema';
import { eq, and, desc, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = 1; // Placeholder

    // Get all rooms where user is a member
    const userRooms = await db
      .select({
        room: messageRooms,
        member: roomMembers,
      })
      .from(roomMembers)
      .innerJoin(messageRooms, eq(messageRooms.id, roomMembers.roomId))
      .where(eq(roomMembers.userId, userId))
      .orderBy(desc(messageRooms.lastMessageAt));

    // For each room, get the other member's info (for direct chats)
    const roomsWithDetails = await Promise.all(
      userRooms.map(async ({ room, member }) => {
        // Get other members in the room
        const otherMembers = await db
          .select({
            userId: roomMembers.userId,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
          })
          .from(roomMembers)
          .innerJoin(users, eq(users.id, roomMembers.userId))
          .where(
            and(
              eq(roomMembers.roomId, room.id),
              // @ts-ignore
              or(eq(users.id, roomMembers.userId))
            )
          );

        // Filter out current user
        const otherUser = otherMembers.find(m => m.userId !== userId);

        // Get last message
        const lastMessage = await db
          .select()
          .from(roomMessages)
          .where(eq(roomMessages.roomId, room.id))
          .orderBy(desc(roomMessages.createdAt))
          .limit(1);

        return {
          id: room.id.toString(),
          roomId: room.id,
          userId: otherUser?.userId || 0,
          username: otherUser?.userName || 'Unknown',
          realName: otherUser?.userName || 'Unknown User',
          avatar: otherUser?.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.userName || 'User')}&background=random`,
          lastMessage: lastMessage[0]?.content || 'No messages yet',
          lastMessageTime: lastMessage[0]?.createdAt || room.createdAt,
          unreadCount: 0, // TODO: Calculate from messageReadReceipts
          isPinned: member.isPinned,
        };
      })
    );

    return NextResponse.json({ success: true, data: roomsWithDetails });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch rooms' } },
      { status: 500 }
    );
  }
}

// Create a new chat room (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otherUserId, type = 'direct' } = body;

    // TODO: Get userId from session/auth
    const userId = 1; // Placeholder

    // Check if room already exists for these two users
    const existingRooms = await db
      .select({ roomId: roomMembers.roomId })
      .from(roomMembers)
      .where(eq(roomMembers.userId, userId));

    for (const { roomId } of existingRooms) {
      const members = await db
        .select()
        .from(roomMembers)
        .where(eq(roomMembers.roomId, roomId));

      if (members.length === 2) {
        const memberIds = members.map(m => m.userId);
        if (memberIds.includes(userId) && memberIds.includes(otherUserId)) {
          // Room already exists
          return NextResponse.json({
            success: true,
            data: { roomId, message: 'Room already exists' }
          });
        }
      }
    }

    // Create new room
    const [newRoom] = await db
      .insert(messageRooms)
      .values({
        type,
        name: null,
        avatarUrl: null,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      })
      .returning();

    // Add both users as members
    await db.insert(roomMembers).values([
      {
        roomId: newRoom.id,
        userId,
        role: 'admin',
        joinedAt: new Date().toISOString(),
        isPinned: false,
        isMuted: false,
      },
      {
        roomId: newRoom.id,
        userId: otherUserId,
        role: 'member',
        joinedAt: new Date().toISOString(),
        isPinned: false,
        isMuted: false,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: { roomId: newRoom.id, message: 'Room created successfully' }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create room' } },
      { status: 500 }
    );
  }
}

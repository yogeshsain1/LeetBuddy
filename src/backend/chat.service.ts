import { Injectable } from '@nestjs/common';
import { eq, and, desc, lt, gt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as schema from '../db/schema/chat';
import { db } from '../db';

@Injectable()
export class ChatService {
  private db = db;

  // ==================== Room Management ====================

  async createDirectRoom(userId1: string, userId2: string): Promise<string> {
    // Create deterministic room ID
    const sorted = [userId1, userId2].sort();
    const roomId = `direct_${sorted[0]}_${sorted[1]}`;

    // Check if room already exists
    const existing = await this.db.query.chatRooms.findFirst({
      where: eq(schema.chatRooms.id, roomId),
    });

    if (existing) {
      return roomId;
    }

    // Create new room
    await this.db.insert(schema.chatRooms).values({
      id: roomId,
      type: 'direct',
      createdBy: userId1,
    });

    // Add members
    await this.db.insert(schema.chatMembers).values([
      { id: uuidv4(), roomId, userId: userId1, role: 'member' },
      { id: uuidv4(), roomId, userId: userId2, role: 'member' },
    ]);

    return roomId;
  }

  async createRoom(data: {
    type: 'direct' | 'group';
    name?: string;
    description?: string;
    isPrivate: boolean;
    createdBy: string;
    memberIds: string[];
  }): Promise<any> {
    const roomId = data.type === 'group' ? `group_${uuidv4()}` : await this.createDirectRoom(data.memberIds[0], data.memberIds[1]);

    if (data.type === 'group') {
      await this.db.insert(schema.chatRooms).values({
        id: roomId,
        type: data.type,
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
        createdBy: data.createdBy,
      });

      // Add creator as admin
      await this.db.insert(schema.chatMembers).values({
        id: uuidv4(),
        roomId,
        userId: data.createdBy,
        role: 'admin',
      });

      // Add other members
      const otherMembers = data.memberIds.filter(id => id !== data.createdBy);
      if (otherMembers.length > 0) {
        await this.db.insert(schema.chatMembers).values(
          otherMembers.map(userId => ({
            id: uuidv4(),
            roomId,
            userId,
            role: 'member' as const,
          }))
        );
      }
    }

    return {
      id: roomId,
      type: data.type,
      name: data.name,
      memberIds: data.memberIds,
    };
  }

  async getUserRooms(userId: string): Promise<any[]> {
    const members = await this.db.query.chatMembers.findMany({
      where: and(
        eq(schema.chatMembers.userId, userId),
        eq(schema.chatMembers.role, 'member')
      ),
      with: {
        room: true,
      },
    });

    return members.map(m => m.room);
  }

  async isRoomMember(roomId: string, userId: string): Promise<boolean> {
    const member = await this.db.query.chatMembers.findFirst({
      where: and(
        eq(schema.chatMembers.roomId, roomId),
        eq(schema.chatMembers.userId, userId)
      ),
    });

    return !!member && member.role !== 'left';
  }

  // ==================== Message Management ====================

  async createMessage(data: {
    roomId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'audio' | 'video';
    replyToId?: string;
    metadata?: any;
  }): Promise<any> {
    const messageId = uuidv4();

    const [message] = await this.db.insert(schema.chatMessages).values({
      id: messageId,
      roomId: data.roomId,
      senderId: data.senderId,
      content: data.content,
      type: data.type,
      replyToId: data.replyToId,
      metadata: data.metadata,
    }).returning();

    // Create status for all room members
    const members = await this.db.query.chatMembers.findMany({
      where: eq(schema.chatMembers.roomId, data.roomId),
    });

    await this.db.insert(schema.chatMessageStatus).values(
      members.map(member => ({
        id: uuidv4(),
        messageId,
        userId: member.userId,
        status: member.userId === data.senderId ? 'read' : 'sent',
      }))
    );

    return message;
  }

  async getMessageById(messageId: string): Promise<any> {
    return await this.db.query.chatMessages.findFirst({
      where: eq(schema.chatMessages.id, messageId),
    });
  }

  async getMessageHistory(params: {
    roomId: string;
    cursor?: string;
    limit: number;
    direction: 'before' | 'after';
  }): Promise<{ messages: any[]; nextCursor: string | null; hasMore: boolean }> {
    const { roomId, cursor, limit, direction } = params;

    let query = this.db.query.chatMessages.findMany({
      where: and(
        eq(schema.chatMessages.roomId, roomId),
        cursor
          ? direction === 'before'
            ? lt(schema.chatMessages.createdAt, new Date(cursor))
            : gt(schema.chatMessages.createdAt, new Date(cursor))
          : undefined
      ),
      orderBy: desc(schema.chatMessages.createdAt),
      limit: limit + 1, // Fetch one extra to check hasMore
    });

    const messages = await query;
    const hasMore = messages.length > limit;

    if (hasMore) {
      messages.pop(); // Remove extra message
    }

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].createdAt.toISOString() : null;

    return {
      messages: direction === 'after' ? messages.reverse() : messages,
      nextCursor,
      hasMore,
    };
  }

  async editMessage(messageId: string, content: string): Promise<any> {
    const [updated] = await this.db.update(schema.chatMessages)
      .set({
        content,
        editedAt: new Date(),
      })
      .where(eq(schema.chatMessages.id, messageId))
      .returning();

    return updated;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.db.update(schema.chatMessages)
      .set({
        deletedAt: new Date(),
        content: '[Deleted]',
      })
      .where(eq(schema.chatMessages.id, messageId));
  }

  // ==================== Message Status ====================

  async markMessagesAsRead(messageIds: string[], userId: string): Promise<void> {
    await this.db.update(schema.chatMessageStatus)
      .set({
        status: 'read',
        readAt: new Date(),
      })
      .where(
        and(
          eq(schema.chatMessageStatus.userId, userId),
          // messageIds in array
        )
      );
  }

  async updateLastRead(roomId: string, userId: string, messageId: string): Promise<void> {
    await this.db.update(schema.chatMembers)
      .set({
        lastReadMessageId: messageId,
        lastReadAt: new Date(),
      })
      .where(
        and(
          eq(schema.chatMembers.roomId, roomId),
          eq(schema.chatMembers.userId, userId)
        )
      );
  }

  // ==================== User Contacts ====================

  async getUserContacts(userId: string): Promise<any[]> {
    // Get all rooms where user is a member
    const rooms = await this.getUserRooms(userId);
    
    // Get all other members from these rooms
    const contacts: any[] = [];
    
    for (const room of rooms) {
      const members = await this.db.query.chatMembers.findMany({
        where: and(
          eq(schema.chatMembers.roomId, room.id),
          // userId !== userId
        ),
      });
      
      contacts.push(...members);
    }

    return contacts;
  }

  async getPendingMessages(userId: string): Promise<any[]> {
    // Get unread messages for user
    const statuses = await this.db.query.chatMessageStatus.findMany({
      where: and(
        eq(schema.chatMessageStatus.userId, userId),
        eq(schema.chatMessageStatus.status, 'sent')
      ),
      with: {
        message: true,
      },
      limit: 100,
    });

    return statuses.map(s => s.message);
  }
}

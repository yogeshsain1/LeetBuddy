import { db } from '../../db';
import { 
  roomMessages, 
  messageRooms, 
  roomMembers, 
  messageReactions,
  messageReadReceipts,
  realtimeNotifications 
} from '../../db/schema/messages';
import { user } from '../../db/schema/auth';
import { eq, and, desc, sql } from 'drizzle-orm';
import { cacheMessage, incrementUnreadCount } from '../../lib/redis';

export interface SendMessageData {
  roomId: number;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'code' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  codeLanguage?: string;
  replyToId?: number;
}

export interface Message {
  id: number;
  roomId: number;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  type: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  thumbnailUrl?: string | null;
  codeLanguage?: string | null;
  replyToId?: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  reactions?: Array<{ emoji: string; count: number; users: string[] }>;
}

// ==================== CREATE MESSAGE ====================

export async function createMessage(data: SendMessageData): Promise<Message | null> {
  try {
    const now = new Date().toISOString();

    // Verify sender is a member of the room
    const membership = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, data.roomId),
          eq(roomMembers.userId, String(data.senderId))
        )
      )
      .limit(1);

    if (!membership || membership.length === 0) {
      console.error('User is not a member of this room');
      return null;
    }

    // Create the message
    const [newMessage] = await db
      .insert(roomMessages)
      .values({
        roomId: data.roomId,
        senderId: String(data.senderId),
        content: data.content,
        type: data.type || 'text',
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        thumbnailUrl: data.thumbnailUrl,
        codeLanguage: data.codeLanguage,
        replyToId: data.replyToId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Update room's last message timestamp
    await db
      .update(messageRooms)
      .set({ lastMessageAt: now, updatedAt: now })
      .where(eq(messageRooms.id, data.roomId));

    // Get sender info
    const [sender] = await db
      .select({
        username: user.username,
        avatarUrl: user.image,
      })
      .from(user)
      .where(eq(user.id, String(data.senderId)))
      .limit(1);

    // Create full message object
    const message: Message = {
      id: newMessage.id,
      roomId: newMessage.roomId,
      senderId: newMessage.senderId,
      senderName: sender?.username || 'Unknown',
      senderAvatar: sender?.avatarUrl || null,
      content: newMessage.content,
      type: newMessage.type,
      fileUrl: newMessage.fileUrl,
      fileName: newMessage.fileName,
      fileSize: newMessage.fileSize,
      mimeType: newMessage.mimeType,
      thumbnailUrl: newMessage.thumbnailUrl,
      codeLanguage: newMessage.codeLanguage,
      replyToId: newMessage.replyToId,
      isEdited: Boolean(newMessage.isEdited),
      isDeleted: Boolean(newMessage.isDeleted),
      isPinned: Boolean(newMessage.isPinned),
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
      reactions: [],
    };

    // Cache the message
    await cacheMessage(data.roomId, message);

    // Increment unread count for all other room members
    const members = await db
      .select({ userId: roomMembers.userId })
      .from(roomMembers)
      .where(eq(roomMembers.roomId, data.roomId));

    for (const member of members) {
      if (String(member.userId) !== String(data.senderId)) {
        await incrementUnreadCount(String(member.userId), data.roomId);
      }
    }

    return message;
  } catch (error) {
    console.error('Error creating message:', error);
    return null;
  }
}

// ==================== GET MESSAGES ====================

export async function getMessages(
  roomId: number,
  limit = 50,
  beforeId?: number
): Promise<Message[]> {
  try {
    const query = db
      .select({
        id: roomMessages.id,
        roomId: roomMessages.roomId,
        senderId: roomMessages.senderId,
        senderName: user.name,
        senderAvatar: user.image,
        content: roomMessages.content,
        type: roomMessages.type,
        fileUrl: roomMessages.fileUrl,
        fileName: roomMessages.fileName,
        fileSize: roomMessages.fileSize,
        mimeType: roomMessages.mimeType,
        thumbnailUrl: roomMessages.thumbnailUrl,
        codeLanguage: roomMessages.codeLanguage,
        replyToId: roomMessages.replyToId,
        isEdited: roomMessages.isEdited,
        isDeleted: roomMessages.isDeleted,
        isPinned: roomMessages.isPinned,
        createdAt: roomMessages.createdAt,
        updatedAt: roomMessages.updatedAt,
      })
      .from(roomMessages)
      .leftJoin(user, eq(user.id, roomMessages.senderId))
      .where(beforeId ? and(eq(roomMessages.roomId, roomId), sql`${roomMessages.id} < ${beforeId}`) : eq(roomMessages.roomId, roomId))
      .orderBy(desc(roomMessages.createdAt))
      .limit(limit);

    const messages = await query;

    return messages.map((msg): Message => ({
      ...msg,
      senderName: msg.senderName || 'Unknown',
      isEdited: Boolean(msg.isEdited),
      isDeleted: Boolean(msg.isDeleted),
      isPinned: Boolean(msg.isPinned),
      reactions: [],
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// ==================== EDIT MESSAGE ====================

export async function editMessage(
  messageId: number,
  userId: string,
  newContent: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    const result = await db
      .update(roomMessages)
      .set({
        content: newContent,
        isEdited: true,
        editedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(roomMessages.id, messageId),
          eq(roomMessages.senderId, String(userId))
        )
      );

    return true;
  } catch (error) {
    console.error('Error editing message:', error);
    return false;
  }
}

// ==================== DELETE MESSAGE ====================

export async function deleteMessage(
  messageId: number,
  userId: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    await db
      .update(roomMessages)
      .set({
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
        content: '[Message deleted]',
      })
      .where(
        and(
          eq(roomMessages.id, messageId),
          eq(roomMessages.senderId, String(userId))
        )
      );

    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

// ==================== MESSAGE REACTIONS ====================

export async function addReaction(
  messageId: number,
  userId: string,
  emoji: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    // Check if reaction already exists
    const existing = await db
      .select()
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, String(userId)),
          eq(messageReactions.emoji, emoji)
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      return false; // Already reacted
    }

    await db.insert(messageReactions).values({
      messageId,
      userId: String(userId),
      emoji,
      createdAt: now,
    });

    return true;
  } catch (error) {
    console.error('Error adding reaction:', error);
    return false;
  }
}

export async function removeReaction(
  messageId: number,
  userId: string,
  emoji: string
): Promise<boolean> {
  try {
    await db
      .delete(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, String(userId)),
          eq(messageReactions.emoji, emoji)
        )
      );

    return true;
  } catch (error) {
    console.error('Error removing reaction:', error);
    return false;
  }
}

// ==================== READ RECEIPTS ====================

export async function markAsRead(
  messageId: number,
  userId: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    // Check if already read
    const existing = await db
      .select()
      .from(messageReadReceipts)
      .where(
        and(
          eq(messageReadReceipts.messageId, messageId),
          eq(messageReadReceipts.userId, String(userId))
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      return true; // Already marked as read
    }

    await db.insert(messageReadReceipts).values({
      messageId,
      userId: String(userId),
      readAt: now,
    });

    // Update last read in room_members
    const [message] = await db
      .select({ roomId: roomMessages.roomId })
      .from(roomMessages)
      .where(eq(roomMessages.id, messageId))
      .limit(1);

    if (message) {
      await db
        .update(roomMembers)
        .set({
          lastReadMessageId: messageId,
          lastReadAt: now,
        })
        .where(
          and(
            eq(roomMembers.roomId, message.roomId),
            eq(roomMembers.userId, String(userId))
          )
        );
    }

    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

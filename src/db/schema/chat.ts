import { sql } from 'drizzle-orm';
import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  pgEnum,
  index,
  uniqueIndex,
  json
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roomTypeEnum = pgEnum('room_type', ['direct', 'group']);
export const memberRoleEnum = pgEnum('member_role', ['admin', 'member', 'left']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'file', 'audio', 'video', 'system']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);
export const userStatusEnum = pgEnum('user_status', ['online', 'offline', 'away', 'busy']);

// Chat Rooms Table
export const chatRooms = pgTable('chat_rooms', {
  id: varchar('id', { length: 255 }).primaryKey(),
  type: roomTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isPrivate: boolean('is_private').default(false).notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  typeIdx: index('idx_room_type').on(table.type),
  createdByIdx: index('idx_room_created_by').on(table.createdBy),
  createdAtIdx: index('idx_room_created_at').on(table.createdAt),
}));

// Chat Members Table
export const chatMembers = pgTable('chat_members', {
  id: varchar('id', { length: 255 }).primaryKey(),
  roomId: varchar('room_id', { length: 255 }).notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(),
  role: memberRoleEnum('role').default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
  lastReadMessageId: varchar('last_read_message_id', { length: 255 }),
  lastReadAt: timestamp('last_read_at'),
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
}, (table) => ({
  roomUserUnique: uniqueIndex('unique_room_user').on(table.roomId, table.userId),
  userIdIdx: index('idx_member_user_id').on(table.userId),
  roomIdIdx: index('idx_member_room_id').on(table.roomId),
  roleIdx: index('idx_member_role').on(table.role),
}));

// Chat Messages Table
export const chatMessages = pgTable('chat_messages', {
  id: varchar('id', { length: 255 }).primaryKey(),
  roomId: varchar('room_id', { length: 255 }).notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  senderId: varchar('sender_id', { length: 255 }).notNull(),
  content: text('content').notNull(),
  type: messageTypeEnum('type').default('text').notNull(),
  replyToId: varchar('reply_to_id', { length: 255 }),
  metadata: json('metadata').$type<{
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    dimensions?: { width: number; height: number };
    thumbnailUrl?: string;
    url?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  roomCreatedIdx: index('idx_message_room_created').on(table.roomId, table.createdAt.desc()),
  senderIdx: index('idx_message_sender').on(table.senderId),
  replyToIdx: index('idx_message_reply_to').on(table.replyToId),
}));

// Chat Message Status Table
export const chatMessageStatus = pgTable('chat_message_status', {
  id: varchar('id', { length: 255 }).primaryKey(),
  messageId: varchar('message_id', { length: 255 }).notNull().references(() => chatMessages.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(),
  status: messageStatusEnum('status').default('sent').notNull(),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
}, (table) => ({
  messageUserUnique: uniqueIndex('unique_message_user').on(table.messageId, table.userId),
  messageIdIdx: index('idx_status_message_id').on(table.messageId),
  userStatusIdx: index('idx_status_user_status').on(table.userId, table.status),
}));

// Chat User Presence Table
export const chatUserPresence = pgTable('chat_user_presence', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  status: userStatusEnum('status').default('offline').notNull(),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
  socketId: varchar('socket_id', { length: 255 }),
  deviceInfo: json('device_info').$type<{
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    browser?: string;
    os?: string;
    appVersion?: string;
  }>(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('idx_presence_status').on(table.status),
  lastSeenIdx: index('idx_presence_last_seen').on(table.lastSeen),
}));

// Relations
export const chatRoomsRelations = relations(chatRooms, ({ many }) => ({
  members: many(chatMembers),
  messages: many(chatMessages),
}));

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMembers.roomId],
    references: [chatRooms.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  replyTo: one(chatMessages, {
    fields: [chatMessages.replyToId],
    references: [chatMessages.id],
  }),
  statuses: many(chatMessageStatus),
}));

export const chatMessageStatusRelations = relations(chatMessageStatus, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatMessageStatus.messageId],
    references: [chatMessages.id],
  }),
}));

// Type exports for TypeScript
export type ChatRoom = typeof chatRooms.$inferSelect;
export type NewChatRoom = typeof chatRooms.$inferInsert;
export type ChatMember = typeof chatMembers.$inferSelect;
export type NewChatMember = typeof chatMembers.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessageStatus = typeof chatMessageStatus.$inferSelect;
export type NewChatMessageStatus = typeof chatMessageStatus.$inferInsert;
export type ChatUserPresence = typeof chatUserPresence.$inferSelect;
export type NewChatUserPresence = typeof chatUserPresence.$inferInsert;

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "../schema";

// ==================== REAL-TIME MESSAGING SYSTEM ====================

// Message Rooms (for both direct and group chats)
export const messageRooms = sqliteTable("message_rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // 'direct' | 'group'
  name: text("name"), // For group chats
  avatarUrl: text("avatar_url"),
  createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastMessageAt: text("last_message_at"), // For sorting rooms by activity
});

// Room Members (who's in each chat room)
export const roomMembers = sqliteTable("room_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").notNull().references(() => messageRooms.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull().default("member"), // 'admin' | 'member'
  joinedAt: text("joined_at").notNull(),
  lastReadMessageId: integer("last_read_message_id"), // For read receipts
  lastReadAt: text("last_read_at"),
  isPinned: integer("is_pinned", { mode: 'boolean' }).default(false).notNull(),
  isMuted: integer("is_muted", { mode: 'boolean' }).default(false).notNull(),
}, (table) => ({
  roomIdIdx: index("room_members_room_id_idx").on(table.roomId),
  userIdIdx: index("room_members_user_id_idx").on(table.userId),
}));

// Room Messages (Enhanced with all features)
export const roomMessages = sqliteTable("room_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").notNull().references(() => messageRooms.id, { onDelete: 'cascade' }),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // 'text' | 'image' | 'file' | 'code' | 'system'
  
  // File attachments
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  thumbnailUrl: text("thumbnail_url"), // For image previews
  
  // Code snippets
  codeLanguage: text("code_language"),
  
  // Reply/thread features
  replyToId: integer("reply_to_id"),
  
  // Status flags
  isEdited: integer("is_edited", { mode: 'boolean' }).notNull().default(false),
  isDeleted: integer("is_deleted", { mode: 'boolean' }).notNull().default(false),
  isPinned: integer("is_pinned", { mode: 'boolean' }).notNull().default(false),
  
  // Timestamps
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  editedAt: text("edited_at"),
  deletedAt: text("deleted_at"),
}, (table) => ({
  roomIdIdx: index("room_messages_room_id_idx").on(table.roomId),
  senderIdIdx: index("room_messages_sender_id_idx").on(table.senderId),
  createdAtIdx: index("room_messages_created_at_idx").on(table.createdAt),
}));

// Message Reactions (emoji reactions to messages)
export const messageReactions = sqliteTable("message_reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  messageId: integer("message_id").notNull().references(() => roomMessages.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  emoji: text("emoji").notNull(), // '👍', '❤️', '😂', '😮', '😢', '🙏'
  createdAt: text("created_at").notNull(),
}, (table) => ({
  messageIdIdx: index("message_reactions_message_id_idx").on(table.messageId),
}));

// Message Read Receipts (track who read which messages)
export const messageReadReceipts = sqliteTable("message_read_receipts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  messageId: integer("message_id").notNull().references(() => roomMessages.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  readAt: text("read_at").notNull(),
}, (table) => ({
  messageIdIdx: index("message_read_receipts_message_id_idx").on(table.messageId),
  userIdIdx: index("message_read_receipts_user_id_idx").on(table.userId),
}));

// File Uploads (track all uploaded files)
export const fileUploads = sqliteTable("file_uploads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), // For images
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
}, (table) => ({
  userIdIdx: index("file_uploads_user_id_idx").on(table.userId),
}));

// Notifications (Enhanced for real-time)
export const realtimeNotifications = sqliteTable("realtime_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'message' | 'friend_request' | 'mention' | 'reaction' | 'friend_accepted'
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data", { mode: 'json' }), // Additional data as JSON
  link: text("link"), // URL to navigate to
  avatarUrl: text("avatar_url"), // User avatar who triggered notification
  isRead: integer("is_read", { mode: 'boolean' }).notNull().default(false),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  userIdIdx: index("realtime_notifications_user_id_idx").on(table.userId),
  createdAtIdx: index("realtime_notifications_created_at_idx").on(table.createdAt),
}));

// User Presence (online/offline status - complement Redis cache)
export const userPresence = sqliteTable("user_presence", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default("offline"), // 'online' | 'away' | 'busy' | 'offline'
  lastSeen: text("last_seen").notNull(),
  customStatus: text("custom_status"), // Optional custom status message
  updatedAt: text("updated_at").notNull(),
});

// Typing Indicators (temporary - mainly Redis, but backup in DB)
export const typingIndicators = sqliteTable("typing_indicators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").notNull().references(() => messageRooms.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isTyping: integer("is_typing", { mode: 'boolean' }).notNull().default(true),
  startedAt: text("started_at").notNull(),
  expiresAt: text("expires_at").notNull(), // Auto-expire after 5 seconds
});

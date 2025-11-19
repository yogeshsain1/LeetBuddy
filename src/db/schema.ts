import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// ==================== ENUM DEFINITIONS ====================
// friend_status: 'pending', 'accepted', 'rejected', 'blocked'
// message_type: 'text', 'image', 'file', 'code'
// group_role: 'owner', 'admin', 'member'
// notification_type: 'friend_request', 'friend_accepted', 'message', 'group_invite'
// theme: 'light', 'dark', 'auto'

// ==================== BETTER AUTH TABLES ====================
export * from './schema/auth';

// ==================== REAL-TIME MESSAGING EXPORTS ====================
export * from './schema/messages';

// ==================== CORE USER TABLES ====================

// 1. Users - Core authentication and profile data
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  leetcodeUsername: text('leetcode_username'),
  githubUrl: text('github_url'),
  location: text('location'),
  website: text('website'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  lastLoginAt: text('last_login_at'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

// 2. LeetCode Stats - User's LeetCode statistics
export const leetcodeStats = sqliteTable('leetcode_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  easyCount: integer('easy_count').default(0).notNull(),
  mediumCount: integer('medium_count').default(0).notNull(),
  hardCount: integer('hard_count').default(0).notNull(),
  totalSolved: integer('total_solved').default(0).notNull(),
  contestRating: integer('contest_rating').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastSyncedAt: text('last_synced_at'),
  updatedAt: text('updated_at').notNull(),
});

// 3. Friendships - Mutual friend relationships with privacy
export const friendships = sqliteTable('friendships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requesterId: integer('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addresseeId: integer('addressee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // 'pending', 'accepted', 'rejected', 'blocked'
  requestedAt: text('requested_at').notNull(),
  respondedAt: text('responded_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ==================== MESSAGING SYSTEM (FRIENDS ONLY) ====================

// 4. Direct Messages - 1:1 messages between friends
export const directMessages = sqliteTable('direct_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: integer('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type').default('text').notNull(), // 'text', 'image', 'file', 'code'
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  codeLanguage: text('code_language'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  isEdited: integer('is_edited', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ==================== GROUP SYSTEM (USER CREATED) ====================

// 5. Groups - User-created study groups
export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isPrivate: integer('is_private', { mode: 'boolean' }).default(false).notNull(),
  maxMembers: integer('max_members').default(50).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 6. Group Members - Many-to-many for group membership
export const groupMembers = sqliteTable('group_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').default('member').notNull(), // 'owner', 'admin', 'member'
  joinedAt: text('joined_at').notNull(),
  leftAt: text('left_at'),
});

// 7. Group Invitations - Invites to join groups
export const groupInvitations = sqliteTable('group_invitations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  inviterId: integer('inviter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  inviteeId: integer('invitee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('pending').notNull(), // 'pending', 'accepted', 'declined'
  createdAt: text('created_at').notNull(),
  respondedAt: text('responded_at'),
});

// 8. Group Messages - Messages in groups
export const groupMessages = sqliteTable('group_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type').default('text').notNull(), // 'text', 'image', 'file', 'code'
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  codeLanguage: text('code_language'),
  isEdited: integer('is_edited', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ==================== ACTIVITY & NOTIFICATIONS ====================

// 9. User Activities - Track user actions for feed
export const userActivities = sqliteTable('user_activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull(), // 'problem_solved', 'streak_milestone', 'friend_added'
  title: text('title').notNull(),
  description: text('description'),
  metadata: text('metadata', { mode: 'json' }), // Store additional data as JSON
  createdAt: text('created_at').notNull(),
});

// 10. Notifications - User notifications
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'friend_request', 'friend_accepted', 'message', 'group_invite'
  title: text('title').notNull(),
  content: text('content').notNull(),
  relatedId: integer('related_id'), // ID of related entity (friendship, message, etc.)
  relatedType: text('related_type'), // Type of related entity
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

// ==================== SETTINGS ====================

// 11. User Settings - User preferences (1-1 with Users)
export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).default(true).notNull(),
  friendRequestNotifications: integer('friend_request_notifications', { mode: 'boolean' }).default(true).notNull(),
  messageNotifications: integer('message_notifications', { mode: 'boolean' }).default(true).notNull(),
  groupNotifications: integer('group_notifications', { mode: 'boolean' }).default(true).notNull(),
  profileVisibility: text('profile_visibility').default('friends').notNull(), // 'public', 'friends', 'private'
  showLeetCodeStats: integer('show_leetcode_stats', { mode: 'boolean' }).default(true).notNull(),
  theme: text('theme').default('auto').notNull(), // 'light', 'dark', 'auto'
  language: text('language').default('en').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
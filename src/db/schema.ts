import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// ==================== ENUM DEFINITIONS ====================
// difficulty_level: 'easy', 'medium', 'hard'
// vote_type: 'upvote', 'downvote'
// role: 'admin', 'moderator', 'member'
// notification_type: 'like', 'comment', 'follow', 'mention', 'answer', 'message'
// theme: 'light', 'dark', 'auto'
// report_status: 'pending', 'reviewed', 'resolved', 'dismissed'
// reported_content_type: 'post', 'comment', 'doubt', 'user'

// ==================== CORE USER TABLES ====================

// 1. Users - Core authentication and profile data
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  lastLoginAt: text('last_login_at'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

// 2. UserProfile - Extended user information (1-1 with Users)
export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  leetcodeUsername: text('leetcode_username'),
  githubUrl: text('github_url'),
  location: text('location'),
  website: text('website'),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  totalProblemsSolved: integer('total_problems_solved').default(0).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 3. Followers - Many-to-many self-referential relationship
export const followers = sqliteTable('followers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

// ==================== POSTS & ENGAGEMENT ====================

// 4. Posts - User posts/thoughts/code snippets
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  codeSnippet: text('code_snippet'),
  language: text('language'),
  problemLink: text('problem_link'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 5. PostLikes - Many-to-many for post likes
export const postLikes = sqliteTable('post_likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

// 6. Comments - Comments on posts
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  parentCommentId: integer('parent_comment_id').references(() => comments.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 7. CommentLikes - Many-to-many for comment likes
export const commentLikes = sqliteTable('comment_likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

// 8. Bookmarks - User bookmarked posts
export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

// ==================== Q&A MODULE ====================

// 9. Doubts - Q&A module for asking questions
export const doubts = sqliteTable('doubts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: text('tags', { mode: 'json' }), // Store as JSON array
  difficultyLevel: text('difficulty_level').notNull(), // 'easy', 'medium', 'hard'
  isResolved: integer('is_resolved', { mode: 'boolean' }).default(false).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 10. DoubtAnswers - Answers to doubts
export const doubtAnswers = sqliteTable('doubt_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  doubtId: integer('doubt_id').notNull().references(() => doubts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  codeSnippet: text('code_snippet'),
  isAccepted: integer('is_accepted', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 11. DoubtAnswerVotes - Upvote/downvote for answers
export const doubtAnswerVotes = sqliteTable('doubt_answer_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  answerId: integer('answer_id').notNull().references(() => doubtAnswers.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  voteType: text('vote_type').notNull(), // 'upvote', 'downvote'
  createdAt: text('created_at').notNull(),
});

// ==================== MESSAGING SYSTEM ====================

// 12. Messages - 1:1 direct messages
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: integer('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

// 13. GroupChats - Group chat rooms
export const groupChats = sqliteTable('group_chats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  creatorId: integer('creator_id').references(() => users.id, { onDelete: 'set null' }),
  avatarUrl: text('avatar_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 14. GroupChatMembers - Many-to-many for group membership
export const groupChatMembers = sqliteTable('group_chat_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').notNull().references(() => groupChats.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'admin', 'moderator', 'member'
  joinedAt: text('joined_at').notNull(),
});

// 15. GroupMessages - Messages in group chats
export const groupMessages = sqliteTable('group_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').notNull().references(() => groupChats.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

// ==================== NOTIFICATIONS & GAMIFICATION ====================

// 16. Notifications - User notifications
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'like', 'comment', 'follow', 'mention', 'answer', 'message'
  content: text('content').notNull(),
  relatedId: integer('related_id'), // Polymorphic reference
  relatedType: text('related_type'), // 'post', 'comment', 'doubt', etc.
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

// 17. UserStreaks - Daily coding streak tracking
export const userStreaks = sqliteTable('user_streaks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  streakDate: text('streak_date').notNull(), // ISO date format
  problemsSolved: integer('problems_solved').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

// 18. LeaderboardStats - Aggregated leaderboard data
export const leaderboardStats = sqliteTable('leaderboard_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  totalPosts: integer('total_posts').default(0).notNull(),
  totalDoubtsAnswered: integer('total_doubts_answered').default(0).notNull(),
  totalAcceptedAnswers: integer('total_accepted_answers').default(0).notNull(),
  reputationScore: integer('reputation_score').default(0).notNull(),
  rank: integer('rank'),
  updatedAt: text('updated_at').notNull(),
});

// ==================== SETTINGS & MODERATION ====================

// 19. UserSettings - User preferences (1-1 with Users)
export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).default(true).notNull(),
  pushNotifications: integer('push_notifications', { mode: 'boolean' }).default(true).notNull(),
  showStreakPublicly: integer('show_streak_publicly', { mode: 'boolean' }).default(true).notNull(),
  showEmailPublicly: integer('show_email_publicly', { mode: 'boolean' }).default(false).notNull(),
  theme: text('theme').default('auto').notNull(), // 'light', 'dark', 'auto'
  language: text('language').default('en').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 20. Reports - Content moderation reports
export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reporterId: integer('reporter_id').references(() => users.id, { onDelete: 'set null' }),
  reportedContentId: integer('reported_content_id').notNull(),
  reportedContentType: text('reported_content_type').notNull(), // 'post', 'comment', 'doubt', 'user'
  reason: text('reason').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  resolutionNotes: text('resolution_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
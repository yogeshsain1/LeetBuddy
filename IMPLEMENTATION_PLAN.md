# LeetSocial Platform - Friend-Based Privacy System Implementation Plan

## Overview
Complete overhaul of LeetSocial to implement a friend-based privacy system where users can only interact with their friends. All data is personalized per user.

## ✅ Completed (Phase 1)

### 1. Database Schema Redesign
- ✅ Created new schema with proper relationships
- ✅ Removed old followers/posts/doubts tables
- ✅ Added `friendships` table with request/accept flow
- ✅ Added `leetcodeStats` table for user statistics
- ✅ Added `directMessages` for friend-to-friend chat
- ✅ Added `groups`, `groupMembers`, `groupInvitations`, `groupMessages`
- ✅ Added `userActivities` for personalized feeds
- ✅ Added `userSettings` with privacy controls

### 2. Authentication System
- ✅ Configured better-auth with email/password
- ✅ Created auth API route at `/api/auth/[...all]`
- ✅ Set up session management
- ✅ Added optional GitHub OAuth support

### 3. Friend System API
- ✅ Created friend management functions in `/lib/friends.ts`
  - `areFriends()` - Check if two users are friends
  - `getUserFriends()` - Get all friends of a user
  - `sendFriendRequest()` - Send friend request
  - `acceptFriendRequest()` - Accept friend request
  - `rejectFriendRequest()` - Reject friend request
  - `removeFriend()` - Remove a friend
  - `getPendingFriendRequests()` - Get pending requests
- ✅ Created `/api/friends` route for friend operations

### 4. Privacy & Route Protection
- ✅ Created middleware to protect routes
- ✅ Redirects unauthenticated users to login
- ✅ Public routes: `/`, `/login`, `/signin`, `/signup`
- ✅ Protected routes: profiles, messages, friends, groups, etc.

## 🚧 In Progress (Phase 2)

### 5. Chat System (Friends Only)
**Status:** Needs Implementation

**Requirements:**
- [ ] Create `/api/messages` route for direct messages
- [ ] Check friendship before allowing chat
- [ ] Implement real-time messaging with WebSocket/Socket.io
- [ ] Add message read receipts
- [ ] Support text, code snippets, images

**Files to Create:**
- `src/app/api/messages/route.ts` - Message CRUD operations
- `src/lib/messages.ts` - Message helper functions
- `src/app/api/messages/[conversationId]/route.ts` - Specific conversation

**Code Structure:**
```typescript
// Check if users are friends before sending message
if (!await areFriends(senderId, receiverId)) {
  throw new Error("Can only message friends");
}
```

### 6. Group System
**Status:** Schema ready, needs implementation

**Requirements:**
- [ ] Create `/api/groups` route for group management
- [ ] Only friends can be invited to groups
- [ ] Group owners can manage members
- [ ] Group messages only visible to members

**Files to Create:**
- `src/app/api/groups/route.ts` - Group CRUD
- `src/app/api/groups/[groupId]/route.ts` - Group details
- `src/app/api/groups/[groupId]/members/route.ts` - Member management
- `src/app/api/groups/[groupId]/messages/route.ts` - Group messages
- `src/lib/groups.ts` - Group helper functions

### 7. Leaderboard System
**Status:** Needs implementation

**Requirements:**
- [ ] Personal leaderboard showing only friends
- [ ] Rank based on LeetCode stats
- [ ] Filter by timeframe (weekly, monthly, all-time)
- [ ] Show stats: problems solved, streak, rating

**Files to Create:**
- `src/app/api/leaderboard/route.ts` - Leaderboard data
- `src/lib/leaderboard.ts` - Ranking logic

**Logic:**
```typescript
// Get current user's friends
const friends = await getUserFriends(userId);

// Get LeetCode stats for friends
const friendStats = await getStatsForUsers(friends.map(f => f.friendId));

// Sort and rank
const ranked = friendStats.sort((a, b) => b.totalSolved - a.totalSolved);
```

## 📝 To Do (Phase 3)

### 8. Update All Pages
**Status:** All pages currently have mock data

**Pages to Update:**

#### `/profile/[username]`
- [ ] Check if viewer is friends with profile owner
- [ ] If not friends, show limited view with "Add Friend" button
- [ ] If friends, show full profile with LeetCode stats
- [ ] Add "Send Message" button for friends

#### `/messages`
- [ ] Remove mock data
- [ ] Show only conversations with friends
- [ ] Implement friend search to start new chat
- [ ] Empty state: "Add friends to start chatting"

#### `/friends`
- [ ] Remove mock data
- [ ] Show actual friends list from database
- [ ] Show pending friend requests
- [ ] Search for users by username
- [ ] Send friend requests

#### `/leaderboard`
- [ ] Remove mock leaderboard
- [ ] Show only friends on leaderboard
- [ ] Fetch real LeetCode stats
- [ ] Add filters (weekly, monthly, all-time)

#### `/activity`
- [ ] Remove mock activities
- [ ] Show activities from friends only
- [ ] Types: problem solved, streak milestone, friend added
- [ ] Fetch from `userActivities` table

#### `/community` & `/groups`
- [ ] Remove hardcoded groups
- [ ] Show only groups user is member of
- [ ] Add "Create Group" functionality
- [ ] Show group invitations

#### `/notifications`
- [ ] Remove mock notifications
- [ ] Show real notifications from database
- [ ] Types: friend requests, messages, group invites
- [ ] Mark as read functionality

#### `/settings`
- [ ] Connect to `userSettings` table
- [ ] Privacy settings: profile visibility
- [ ] Notification preferences
- [ ] Theme settings

### 9. LeetCode Integration
**Status:** Not started

**Requirements:**
- [ ] Create `/api/leetcode/sync` route
- [ ] Fetch user stats from LeetCode API
- [ ] Update `leetcodeStats` table
- [ ] Manual sync button in settings
- [ ] Optional: Auto-sync daily

### 10. Real-time Features
**Status:** Not started

**Requirements:**
- [ ] Set up Socket.io server
- [ ] Real-time messaging
- [ ] Online/offline status
- [ ] Typing indicators
- [ ] Message delivered/read receipts

## 🗄️ Database Migration

### Migration Steps:
1. Run `npx drizzle-kit generate:sqlite` to generate new schema
2. Run `npx drizzle-kit push:sqlite` to apply to database
3. Clear existing mock data
4. Seed with test users and friendships

### Seed Data Needed:
- 5-10 test users
- Some friend relationships
- Sample messages between friends
- A few groups with members

## 🔐 Privacy Rules Summary

### Profile Viewing:
- ❌ Non-friends: Can see username, avatar, "Add Friend" button
- ✅ Friends: Can see full profile, LeetCode stats, send messages

### Messaging:
- ❌ Can only message friends
- ❌ Cannot message if not friends

### Leaderboard:
- ❌ Can only see friends on leaderboard
- ❌ No global leaderboard

### Groups:
- ❌ Can only invite friends to groups
- ❌ Must be group member to see messages

### Activity Feed:
- ❌ Can only see activities from friends
- ❌ No global activity feed

## 📊 Key Metrics to Track

- Total users
- Active friendships
- Messages sent (per day)
- Groups created
- Avg problems solved per user
- Friend request acceptance rate

## 🚀 Deployment Checklist

- [ ] Set up environment variables (.env)
- [ ] Configure database connection
- [ ] Run migrations
- [ ] Seed test data
- [ ] Test authentication flow
- [ ] Test friend request flow
- [ ] Test messaging between friends
- [ ] Test group creation and invites
- [ ] Verify privacy rules work
- [ ] Test on Vercel deployment

## 📚 API Routes Summary

### Completed:
- ✅ `/api/auth/[...all]` - Authentication
- ✅ `/api/friends` - Friend management

### To Create:
- [ ] `/api/messages` - Direct messages
- [ ] `/api/messages/[conversationId]` - Specific conversation
- [ ] `/api/groups` - Group management
- [ ] `/api/groups/[groupId]` - Group details
- [ ] `/api/groups/[groupId]/members` - Member management
- [ ] `/api/groups/[groupId]/messages` - Group messages
- [ ] `/api/leaderboard` - Friend leaderboard
- [ ] `/api/leetcode/sync` - Sync LeetCode stats
- [ ] `/api/users/[username]` - User profile
- [ ] `/api/users/search` - Search users
- [ ] `/api/activities` - Activity feed
- [ ] `/api/notifications` - Notifications

## 🎯 Next Steps

1. **Implement Chat System** (Priority 1)
   - Create message API routes
   - Add friendship check before messaging
   - Build real-time messaging UI

2. **Implement Group System** (Priority 2)
   - Create group API routes
   - Build group creation UI
   - Implement invitations

3. **Update All Pages** (Priority 3)
   - Remove mock data from all pages
   - Connect to real APIs
   - Test friend-based privacy

4. **LeetCode Integration** (Priority 4)
   - Sync LeetCode stats
   - Update leaderboard with real data

5. **Real-time Features** (Priority 5)
   - Set up WebSocket server
   - Add real-time messaging
   - Add presence indicators

## 🐛 Known Issues to Fix

- Mock data still in all pages
- No actual authentication UI
- No friend request UI
- No message UI
- Groups are hardcoded
- Leaderboard shows fake data

## 📖 Documentation Needed

- User guide for adding friends
- Group creation guide
- LeetCode integration setup
- API documentation
- Deployment guide

---

**Last Updated:** November 19, 2025
**Status:** Phase 1 Complete ✅ | Phase 2 In Progress 🚧 | Phase 3 To Do 📝

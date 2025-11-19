# LeetSocial REST API Documentation

## 📚 Production-Grade REST API Design

**Version:** 1.0.0  
**Base URL:** `https://api.leetsocial.com/v1`  
**Protocol:** HTTPS only  
**Authentication:** JWT Bearer Token  
**Rate Limiting:** 1000 requests/hour per user  

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Route Index](#api-route-index)
3. [Module APIs](#module-apis)
   - [Auth Module](#1-auth-module)
   - [User Module](#2-user-module)
   - [Posts Module](#3-posts-module)
   - [Comments Module](#4-comments-module)
   - [Likes Module](#5-likes-module)
   - [Doubts Module](#6-doubts-qa-module)
   - [Chat Module](#7-chat-module)
   - [Notifications Module](#8-notifications-module)
   - [Streaks Module](#9-streaks-module)
   - [Leaderboard Module](#10-leaderboard-module)
   - [Search Module](#11-search-module)
   - [Reports Module](#12-reports-module)
4. [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
5. [Validation Rules](#validation-rules)
6. [Middleware Stack](#middleware-stack)
7. [Error Handling](#error-handling)
8. [Pagination Strategy](#pagination-strategy)
9. [Sample Requests & Responses](#sample-requests--responses)

---

## Authentication & Authorization

### **JWT Token Structure**

```typescript
interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  iat: number; // Issued at
  exp: number; // Expiration (24 hours)
}
```

### **Authorization Levels**

| Level | Description | Access |
|-------|-------------|--------|
| **Public** | No authentication required | Anyone |
| **Authenticated** | Valid JWT required | Logged-in users |
| **Owner** | User owns the resource | Resource creator |
| **Admin** | Admin privileges | Admins only |
| **Moderator** | Moderation privileges | Admins + Moderators |

### **Headers**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-API-Version: 1.0.0
X-Request-ID: <uuid>
```

---

## API Route Index

### **Quick Reference**

| Module | Endpoint Prefix | Routes | Auth Required |
|--------|----------------|--------|---------------|
| Auth | `/api/auth` | 6 | Partial |
| User | `/api/users` | 12 | Yes |
| Posts | `/api/posts` | 10 | Yes |
| Comments | `/api/comments` | 7 | Yes |
| Likes | `/api/likes` | 4 | Yes |
| Doubts | `/api/doubts` | 11 | Yes |
| Chat | `/api/chat` | 14 | Yes |
| Notifications | `/api/notifications` | 5 | Yes |
| Streaks | `/api/streaks` | 4 | Yes |
| Leaderboard | `/api/leaderboard` | 3 | Partial |
| Search | `/api/search` | 5 | Partial |
| Reports | `/api/reports` | 6 | Yes |

**Total Endpoints:** 87

---

## Module APIs

---

## 1. Auth Module

**Base:** `/api/auth`

### **1.1 Register User**

```http
POST /api/auth/register
```

**Authentication:** None (Public)  
**Rate Limit:** 5 requests/hour per IP

**Request Body:**

```typescript
{
  email: string;          // Valid email format
  username: string;       // 3-30 chars, alphanumeric + underscore
  password: string;       // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  fullName?: string;      // Optional, max 100 chars
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    userId: number;
    email: string;
    username: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // 86400 (24 hours)
  };
  message: "Registration successful";
}
```

**Errors:**
- `400` - Validation error
- `409` - Email/username already exists
- `429` - Too many registration attempts

---

### **1.2 Login**

```http
POST /api/auth/login
```

**Authentication:** None (Public)  
**Rate Limit:** 10 requests/15 minutes per IP

**Request Body:**

```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean; // Default: false
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    userId: number;
    username: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    profile: {
      avatarUrl: string | null;
      fullName: string | null;
      bio: string | null;
    };
  };
  message: "Login successful";
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Account not verified/inactive
- `429` - Too many login attempts

---

### **1.3 Refresh Token**

```http
POST /api/auth/refresh
```

**Authentication:** Refresh Token Required  
**Rate Limit:** 20 requests/hour

**Request Body:**

```typescript
{
  refreshToken: string;
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

**Errors:**
- `401` - Invalid/expired refresh token

---

### **1.4 Logout**

```http
POST /api/auth/logout
```

**Authentication:** Required  
**Authorization:** Authenticated

**Request Body:**

```typescript
{
  refreshToken: string;
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Logged out successfully";
}
```

---

### **1.5 Verify Email**

```http
POST /api/auth/verify-email
```

**Authentication:** None (Public)  
**Rate Limit:** 5 requests/hour per email

**Request Body:**

```typescript
{
  token: string; // Verification token from email
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Email verified successfully";
}
```

**Errors:**
- `400` - Invalid/expired token
- `404` - User not found

---

### **1.6 Request Password Reset**

```http
POST /api/auth/forgot-password
```

**Authentication:** None (Public)  
**Rate Limit:** 3 requests/day per email

**Request Body:**

```typescript
{
  email: string;
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Password reset email sent";
}
```

---

## 2. User Module

**Base:** `/api/users`

### **2.1 Get User Profile**

```http
GET /api/users/:userId
```

**Authentication:** Required  
**Authorization:** Authenticated

**Path Parameters:**
- `userId` (number) - User ID or "me" for current user

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    id: number;
    username: string;
    email: string; // Only if show_email_publicly = true or owner
    fullName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    leetcodeUsername: string | null;
    githubUrl: string | null;
    location: string | null;
    website: string | null;
    currentStreak: number;
    longestStreak: number;
    totalProblemsSolved: number;
    isFollowing: boolean; // If current user follows this user
    isFollower: boolean;  // If this user follows current user
    stats: {
      followersCount: number;
      followingCount: number;
      postsCount: number;
      doubtsCount: number;
      answersCount: number;
      reputationScore: number;
      rank: number | null;
    };
    createdAt: string; // ISO 8601
  };
}
```

---

### **2.2 Update Profile**

```http
PATCH /api/users/:userId
```

**Authentication:** Required  
**Authorization:** Owner only

**Request Body:**

```typescript
{
  fullName?: string;      // Max 100 chars
  bio?: string;          // Max 500 chars
  avatarUrl?: string;    // Valid URL
  leetcodeUsername?: string;
  githubUrl?: string;    // Valid GitHub URL
  location?: string;     // Max 100 chars
  website?: string;      // Valid URL
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: UserProfile; // Same as Get User Profile
  message: "Profile updated successfully";
}
```

**Errors:**
- `400` - Validation error
- `403` - Not authorized to update this profile
- `404` - User not found

---

### **2.3 Follow User**

```http
POST /api/users/:userId/follow
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    followerId: number;
    followingId: number;
    createdAt: string;
  };
  message: "User followed successfully";
}
```

**Errors:**
- `400` - Cannot follow yourself
- `404` - User not found
- `409` - Already following

---

### **2.4 Unfollow User**

```http
DELETE /api/users/:userId/follow
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "User unfollowed successfully";
}
```

**Errors:**
- `404` - User not found or not following

---

### **2.5 Get Followers**

```http
GET /api/users/:userId/followers?page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    followers: Array<{
      id: number;
      username: string;
      fullName: string | null;
      avatarUrl: string | null;
      bio: string | null;
      isFollowing: boolean; // If current user follows them
      followedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
```

---

### **2.6 Get Following**

```http
GET /api/users/:userId/following?page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** Same structure as Get Followers

---

### **2.7 Get User Posts**

```http
GET /api/users/:userId/posts?cursor=&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `cursor` (string, optional) - Cursor for pagination (ISO timestamp)
- `limit` (number, default: 20, max: 50)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    posts: Array<PostDetail>; // See Posts Module
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
    };
  };
}
```

---

### **2.8 Get User Settings**

```http
GET /api/users/me/settings
```

**Authentication:** Required  
**Authorization:** Owner only

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    showStreakPublicly: boolean;
    showEmailPublicly: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string; // ISO 639-1 code
  };
}
```

---

### **2.9 Update User Settings**

```http
PATCH /api/users/me/settings
```

**Authentication:** Required  
**Authorization:** Owner only

**Request Body:**

```typescript
{
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  showStreakPublicly?: boolean;
  showEmailPublicly?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  language?: string; // ISO 639-1 code
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: UserSettings;
  message: "Settings updated successfully";
}
```

---

### **2.10 Get User Bookmarks**

```http
GET /api/users/me/bookmarks?cursor=&limit=20
```

**Authentication:** Required  
**Authorization:** Owner only

**Response:** Same structure as Get User Posts

---

### **2.11 Search Users**

```http
GET /api/users/search?q=john&page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `q` (string, required) - Search query (min 2 chars)
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    users: Array<{
      id: number;
      username: string;
      fullName: string | null;
      avatarUrl: string | null;
      bio: string | null;
      reputationScore: number;
      isFollowing: boolean;
    }>;
    pagination: PaginationMeta;
  };
}
```

---

### **2.12 Delete Account**

```http
DELETE /api/users/me
```

**Authentication:** Required  
**Authorization:** Owner only

**Request Body:**

```typescript
{
  password: string; // Confirm deletion
  confirmation: "DELETE"; // Must type exactly "DELETE"
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Account deleted successfully";
}
```

---

## 3. Posts Module

**Base:** `/api/posts`

### **3.1 Create Post**

```http
POST /api/posts
```

**Authentication:** Required  
**Authorization:** Authenticated  
**Rate Limit:** 20 posts/hour

**Request Body:**

```typescript
{
  content: string;        // Required, 1-5000 chars
  codeSnippet?: string;  // Optional, max 10000 chars
  language?: string;     // Optional, enum (see validation)
  problemLink?: string;  // Optional, valid URL
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    id: number;
    userId: number;
    content: string;
    codeSnippet: string | null;
    language: string | null;
    problemLink: string | null;
    isPinned: boolean;
    author: {
      id: number;
      username: string;
      avatarUrl: string | null;
    };
    stats: {
      likesCount: number;
      commentsCount: number;
      bookmarksCount: number;
    };
    isLiked: boolean;
    isBookmarked: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: "Post created successfully";
}
```

**Errors:**
- `400` - Validation error
- `429` - Rate limit exceeded

---

### **3.2 Get Post**

```http
GET /api/posts/:postId
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: PostDetail; // Same structure as Create Post response
}
```

**Errors:**
- `404` - Post not found

---

### **3.3 Update Post**

```http
PATCH /api/posts/:postId
```

**Authentication:** Required  
**Authorization:** Owner only

**Request Body:**

```typescript
{
  content?: string;
  codeSnippet?: string;
  language?: string;
  problemLink?: string;
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: PostDetail;
  message: "Post updated successfully";
}
```

**Errors:**
- `403` - Not authorized
- `404` - Post not found

---

### **3.4 Delete Post**

```http
DELETE /api/posts/:postId
```

**Authentication:** Required  
**Authorization:** Owner or Admin

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Post deleted successfully";
}
```

---

### **3.5 Pin Post**

```http
POST /api/posts/:postId/pin
```

**Authentication:** Required  
**Authorization:** Owner only

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    postId: number;
    isPinned: boolean;
  };
  message: "Post pinned successfully";
}
```

**Errors:**
- `400` - Already pinned
- `403` - Not authorized

---

### **3.6 Unpin Post**

```http
DELETE /api/posts/:postId/pin
```

**Authentication:** Required  
**Authorization:** Owner only

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Post unpinned successfully";
}
```

---

### **3.7 Get Feed**

```http
GET /api/posts/feed?cursor=&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `cursor` (string, optional) - Cursor for pagination (ISO timestamp)
- `limit` (number, default: 20, max: 50)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    posts: Array<PostDetail>;
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
    };
  };
}
```

**Feed Algorithm:**
1. Posts from followed users
2. Ordered by `created_at DESC`
3. Excludes own posts (configurable)

---

### **3.8 Get Trending Posts**

```http
GET /api/posts/trending?period=day&limit=20
```

**Authentication:** Optional (Public with reduced data)  
**Authorization:** N/A

**Query Parameters:**
- `period` (enum: 'day' | 'week' | 'month', default: 'day')
- `limit` (number, default: 20, max: 50)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    posts: Array<PostDetail>;
  };
}
```

**Trending Algorithm:**
- Score = (likes × 2 + comments × 3) / age_in_hours^1.5
- Filtered by time period

---

### **3.9 Get Post Likers**

```http
GET /api/posts/:postId/likes?page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    users: Array<{
      id: number;
      username: string;
      avatarUrl: string | null;
      likedAt: string;
    }>;
    pagination: PaginationMeta;
  };
}
```

---

### **3.10 Get Post Comments**

```http
GET /api/posts/:postId/comments?cursor=&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** See Comments Module

---

## 4. Comments Module

**Base:** `/api/comments`

### **4.1 Create Comment**

```http
POST /api/comments
```

**Authentication:** Required  
**Authorization:** Authenticated  
**Rate Limit:** 50 comments/hour

**Request Body:**

```typescript
{
  postId: number;           // Required
  content: string;          // Required, 1-2000 chars
  parentCommentId?: number; // Optional, for nested replies
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    id: number;
    postId: number;
    userId: number;
    content: string;
    parentCommentId: number | null;
    author: {
      id: number;
      username: string;
      avatarUrl: string | null;
    };
    stats: {
      likesCount: number;
      repliesCount: number;
    };
    isLiked: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: "Comment created successfully";
}
```

**Errors:**
- `400` - Validation error or max nesting depth exceeded (3 levels)
- `404` - Post or parent comment not found
- `429` - Rate limit exceeded

---

### **4.2 Get Comment**

```http
GET /api/comments/:commentId
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: CommentDetail; // Same structure as Create Comment
}
```

---

### **4.3 Update Comment**

```http
PATCH /api/comments/:commentId
```

**Authentication:** Required  
**Authorization:** Owner only

**Request Body:**

```typescript
{
  content: string; // Required, 1-2000 chars
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: CommentDetail;
  message: "Comment updated successfully";
}
```

---

### **4.4 Delete Comment**

```http
DELETE /api/comments/:commentId
```

**Authentication:** Required  
**Authorization:** Owner or Admin

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Comment deleted successfully";
}
```

**Note:** Deletes all nested replies (CASCADE)

---

### **4.5 Get Comment Replies**

```http
GET /api/comments/:commentId/replies?cursor=&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    comments: Array<CommentDetail>;
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
    };
  };
}
```

---

### **4.6 Like Comment**

```http
POST /api/comments/:commentId/like
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    commentId: number;
    userId: number;
    createdAt: string;
  };
  message: "Comment liked successfully";
}
```

**Errors:**
- `409` - Already liked

---

### **4.7 Unlike Comment**

```http
DELETE /api/comments/:commentId/like
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Comment unliked successfully";
}
```

---

## 5. Likes Module

**Base:** `/api/likes`

### **5.1 Like Post**

```http
POST /api/posts/:postId/like
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    postId: number;
    userId: number;
    createdAt: string;
  };
  message: "Post liked successfully";
}
```

**Errors:**
- `404` - Post not found
- `409` - Already liked

---

### **5.2 Unlike Post**

```http
DELETE /api/posts/:postId/like
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Post unliked successfully";
}
```

---

### **5.3 Bookmark Post**

```http
POST /api/posts/:postId/bookmark
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    postId: number;
    userId: number;
    createdAt: string;
  };
  message: "Post bookmarked successfully";
}
```

**Errors:**
- `409` - Already bookmarked

---

### **5.4 Remove Bookmark**

```http
DELETE /api/posts/:postId/bookmark
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Bookmark removed successfully";
}
```

---

## 6. Doubts (Q&A) Module

**Base:** `/api/doubts`

### **6.1 Create Doubt**

```http
POST /api/doubts
```

**Authentication:** Required  
**Authorization:** Authenticated  
**Rate Limit:** 10 doubts/hour

**Request Body:**

```typescript
{
  title: string;                  // Required, 10-200 chars
  content: string;                // Required, 20-10000 chars
  tags?: string[];               // Optional, max 5 tags
  difficultyLevel: 'easy' | 'medium' | 'hard';
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    id: number;
    userId: number;
    title: string;
    content: string;
    tags: string[];
    difficultyLevel: string;
    isResolved: boolean;
    viewsCount: number;
    author: {
      id: number;
      username: string;
      avatarUrl: string | null;
    };
    stats: {
      answersCount: number;
      acceptedAnswerId: number | null;
    };
    createdAt: string;
    updatedAt: string;
  };
  message: "Doubt created successfully";
}
```

---

### **6.2 Get Doubt**

```http
GET /api/doubts/:doubtId
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: DoubtDetail; // Same as Create Doubt + increments viewsCount
}
```

---

### **6.3 Update Doubt**

```http
PATCH /api/doubts/:doubtId
```

**Authentication:** Required  
**Authorization:** Owner only

**Request Body:**

```typescript
{
  title?: string;
  content?: string;
  tags?: string[];
  difficultyLevel?: 'easy' | 'medium' | 'hard';
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: DoubtDetail;
  message: "Doubt updated successfully";
}
```

---

### **6.4 Delete Doubt**

```http
DELETE /api/doubts/:doubtId
```

**Authentication:** Required  
**Authorization:** Owner or Admin

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Doubt deleted successfully";
}
```

**Note:** Deletes all answers (CASCADE)

---

### **6.5 Get All Doubts**

```http
GET /api/doubts?page=1&limit=20&status=all&difficulty=all&sort=recent&tags=
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)
- `status` (enum: 'all' | 'resolved' | 'unresolved', default: 'all')
- `difficulty` (enum: 'all' | 'easy' | 'medium' | 'hard', default: 'all')
- `sort` (enum: 'recent' | 'popular' | 'unanswered', default: 'recent')
- `tags` (string, comma-separated tags)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    doubts: Array<DoubtDetail>;
    pagination: PaginationMeta;
  };
}
```

---

### **6.6 Get My Doubts**

```http
GET /api/doubts/me?page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** Same as Get All Doubts

---

### **6.7 Answer Doubt**

```http
POST /api/doubts/:doubtId/answers
```

**Authentication:** Required  
**Authorization:** Authenticated  
**Rate Limit:** 30 answers/hour

**Request Body:**

```typescript
{
  content: string;        // Required, 10-10000 chars
  codeSnippet?: string;  // Optional, max 10000 chars
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    id: number;
    doubtId: number;
    userId: number;
    content: string;
    codeSnippet: string | null;
    isAccepted: boolean;
    author: {
      id: number;
      username: string;
      avatarUrl: string | null;
    };
    stats: {
      upvotes: number;
      downvotes: number;
      score: number;
    };
    myVote: 'upvote' | 'downvote' | null;
    createdAt: string;
    updatedAt: string;
  };
  message: "Answer submitted successfully";
}
```

---

### **6.8 Get Doubt Answers**

```http
GET /api/doubts/:doubtId/answers?page=1&limit=20&sort=score
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)
- `sort` (enum: 'score' | 'recent', default: 'score')

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    answers: Array<AnswerDetail>;
    pagination: PaginationMeta;
  };
}
```

**Note:** Accepted answer always appears first

---

### **6.9 Update Answer**

```http
PATCH /api/doubts/answers/:answerId
```

**Authentication:** Required  
**Authorization:** Owner only

**Request Body:**

```typescript
{
  content?: string;
  codeSnippet?: string;
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: AnswerDetail;
  message: "Answer updated successfully";
}
```

---

### **6.10 Delete Answer**

```http
DELETE /api/doubts/answers/:answerId
```

**Authentication:** Required  
**Authorization:** Owner or Admin

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Answer deleted successfully";
}
```

---

### **6.11 Accept Answer**

```http
POST /api/doubts/answers/:answerId/accept
```

**Authentication:** Required  
**Authorization:** Doubt author only

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    answerId: number;
    doubtId: number;
    isAccepted: true;
  };
  message: "Answer accepted successfully";
}
```

**Business Logic:**
- Unmarks previous accepted answer (if any)
- Marks doubt as resolved
- Awards reputation to answer author (+15 points)

**Errors:**
- `403` - Not the doubt author
- `404` - Answer not found

---

### **6.12 Vote on Answer**

```http
POST /api/doubts/answers/:answerId/vote
```

**Authentication:** Required  
**Authorization:** Authenticated

**Request Body:**

```typescript
{
  voteType: 'upvote' | 'downvote';
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    answerId: number;
    userId: number;
    voteType: string;
    createdAt: string;
  };
  message: "Vote recorded successfully";
}
```

**Business Logic:**
- Changes existing vote if user already voted
- Awards/deducts reputation: upvote (+10), downvote (-5)
- Cannot vote on own answers

**Errors:**
- `400` - Cannot vote on own answer
- `404` - Answer not found

---

### **6.13 Remove Vote**

```http
DELETE /api/doubts/answers/:answerId/vote
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Vote removed successfully";
}
```

---

## 7. Chat Module

**Base:** `/api/chat`

### **7.1 Send Direct Message**

```http
POST /api/chat/messages
```

**Authentication:** Required  
**Authorization:** Authenticated  
**Rate Limit:** 100 messages/hour

**Request Body:**

```typescript
{
  receiverId: number;  // Required
  content: string;     // Required, 1-5000 chars
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    isRead: boolean;
    createdAt: string;
  };
  message: "Message sent successfully";
}
```

**WebSocket Event:** Emits `new_message` to receiver

**Errors:**
- `400` - Cannot message yourself
- `404` - Receiver not found
- `429` - Rate limit exceeded

---

### **7.2 Get Message History**

```http
GET /api/chat/messages/:userId?cursor=&limit=50
```

**Authentication:** Required  
**Authorization:** Authenticated

**Path Parameters:**
- `userId` (number) - Other user in conversation

**Query Parameters:**
- `cursor` (string, optional) - Message ID for pagination
- `limit` (number, default: 50, max: 100)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    messages: Array<{
      id: number;
      senderId: number;
      receiverId: number;
      content: string;
      isRead: boolean;
      createdAt: string;
    }>;
    otherUser: {
      id: number;
      username: string;
      avatarUrl: string | null;
      isOnline: boolean;
    };
    pagination: {
      nextCursor: number | null;
      hasMore: boolean;
    };
  };
}
```

---

### **7.3 Get Conversations**

```http
GET /api/chat/conversations?page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    conversations: Array<{
      userId: number;
      username: string;
      avatarUrl: string | null;
      lastMessage: {
        content: string;
        createdAt: string;
        isRead: boolean;
        senderId: number; // Who sent it
      };
      unreadCount: number;
      isOnline: boolean;
    }>;
    pagination: PaginationMeta;
  };
}
```

**Sorted by:** Last message timestamp DESC

---

### **7.4 Mark Messages as Read**

```http
PATCH /api/chat/messages/:userId/read
```

**Authentication:** Required  
**Authorization:** Authenticated

**Path Parameters:**
- `userId` (number) - Sender whose messages to mark as read

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    markedCount: number;
  };
  message: "Messages marked as read";
}
```

---

### **7.5 Delete Message**

```http
DELETE /api/chat/messages/:messageId
```

**Authentication:** Required  
**Authorization:** Sender only

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Message deleted successfully";
}
```

**Note:** Soft delete (marks as deleted, doesn't remove from DB)

---

### **7.6 Create Group Chat**

```http
POST /api/chat/groups
```

**Authentication:** Required  
**Authorization:** Authenticated

**Request Body:**

```typescript
{
  name: string;           // Required, 3-100 chars
  description?: string;  // Optional, max 500 chars
  memberIds: number[];   // Required, min 1, max 50
  avatarUrl?: string;    // Optional, valid URL
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    description: string | null;
    creatorId: number;
    avatarUrl: string | null;
    isActive: boolean;
    membersCount: number;
    createdAt: string;
  };
  message: "Group created successfully";
}
```

**Business Logic:**
- Creator automatically added as admin
- All memberIds added as members

---

### **7.7 Get Group Chat**

```http
GET /api/chat/groups/:groupId
```

**Authentication:** Required  
**Authorization:** Group member only

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    description: string | null;
    creator: {
      id: number;
      username: string;
      avatarUrl: string | null;
    };
    avatarUrl: string | null;
    isActive: boolean;
    myRole: 'admin' | 'moderator' | 'member';
    members: Array<{
      id: number;
      username: string;
      avatarUrl: string | null;
      role: string;
      joinedAt: string;
    }>;
    stats: {
      membersCount: number;
      messagesCount: number;
    };
    createdAt: string;
  };
}
```

---

### **7.8 Update Group**

```http
PATCH /api/chat/groups/:groupId
```

**Authentication:** Required  
**Authorization:** Admin or Moderator

**Request Body:**

```typescript
{
  name?: string;
  description?: string;
  avatarUrl?: string;
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: GroupDetail;
  message: "Group updated successfully";
}
```

---

### **7.9 Delete Group**

```http
DELETE /api/chat/groups/:groupId
```

**Authentication:** Required  
**Authorization:** Admin only

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Group deleted successfully";
}
```

---

### **7.10 Send Group Message**

```http
POST /api/chat/groups/:groupId/messages
```

**Authentication:** Required  
**Authorization:** Group member only  
**Rate Limit:** 100 messages/hour per group

**Request Body:**

```typescript
{
  content: string; // Required, 1-5000 chars
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    id: number;
    groupId: number;
    userId: number;
    content: string;
    author: {
      id: number;
      username: string;
      avatarUrl: string | null;
    };
    createdAt: string;
  };
  message: "Message sent successfully";
}
```

**WebSocket Event:** Emits `new_group_message` to all group members

---

### **7.11 Get Group Messages**

```http
GET /api/chat/groups/:groupId/messages?cursor=&limit=50
```

**Authentication:** Required  
**Authorization:** Group member only

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    messages: Array<GroupMessageDetail>;
    pagination: {
      nextCursor: number | null;
      hasMore: boolean;
    };
  };
}
```

---

### **7.12 Add Group Member**

```http
POST /api/chat/groups/:groupId/members
```

**Authentication:** Required  
**Authorization:** Admin or Moderator

**Request Body:**

```typescript
{
  userId: number;
  role?: 'member' | 'moderator'; // Default: 'member'
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    groupId: number;
    userId: number;
    role: string;
    joinedAt: string;
  };
  message: "Member added successfully";
}
```

---

### **7.13 Remove Group Member**

```http
DELETE /api/chat/groups/:groupId/members/:userId
```

**Authentication:** Required  
**Authorization:** Admin or Moderator (can't remove admins)

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Member removed successfully";
}
```

---

### **7.14 Leave Group**

```http
POST /api/chat/groups/:groupId/leave
```

**Authentication:** Required  
**Authorization:** Group member

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Left group successfully";
}
```

**Note:** If last admin leaves, group is deactivated

---

## 8. Notifications Module

**Base:** `/api/notifications`

### **8.1 Get Notifications**

```http
GET /api/notifications?page=1&limit=20&unreadOnly=false
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)
- `unreadOnly` (boolean, default: false)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    notifications: Array<{
      id: number;
      type: 'like' | 'comment' | 'follow' | 'mention' | 'answer' | 'message';
      content: string;
      relatedId: number | null;
      relatedType: string | null;
      isRead: boolean;
      actor: {
        id: number;
        username: string;
        avatarUrl: string | null;
      };
      createdAt: string;
    }>;
    unreadCount: number;
    pagination: PaginationMeta;
  };
}
```

---

### **8.2 Mark Notification as Read**

```http
PATCH /api/notifications/:notificationId/read
```

**Authentication:** Required  
**Authorization:** Owner only

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Notification marked as read";
}
```

---

### **8.3 Mark All as Read**

```http
PATCH /api/notifications/read-all
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    markedCount: number;
  };
  message: "All notifications marked as read";
}
```

---

### **8.4 Delete Notification**

```http
DELETE /api/notifications/:notificationId
```

**Authentication:** Required  
**Authorization:** Owner only

**Response:** `200 OK`

```typescript
{
  success: true;
  message: "Notification deleted successfully";
}
```

---

### **8.5 Get Unread Count**

```http
GET /api/notifications/unread-count
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    unreadCount: number;
  };
}
```

---

## 9. Streaks Module

**Base:** `/api/streaks`

### **9.1 Record Daily Activity**

```http
POST /api/streaks
```

**Authentication:** Required  
**Authorization:** Authenticated

**Request Body:**

```typescript
{
  problemsSolved: number; // Required, min 1
  date?: string;         // Optional, ISO date (defaults to today)
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    streakDate: string;
    problemsSolved: number;
    currentStreak: number;
    longestStreak: number;
    isNewRecord: boolean;
  };
  message: "Streak recorded successfully";
}
```

**Business Logic:**
- Updates user profile's current_streak and longest_streak
- Creates/updates user_streaks record for the date

---

### **9.2 Get Current Streak**

```http
GET /api/streaks/me
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    currentStreak: number;
    longestStreak: number;
    totalProblemsSolved: number;
    lastActivityDate: string | null;
    streakIsActive: boolean; // false if last activity > 24h ago
  };
}
```

---

### **9.3 Get Streak Calendar**

```http
GET /api/streaks/me/calendar?year=2024
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `year` (number, default: current year)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    year: number;
    days: Array<{
      date: string;           // ISO date
      problemsSolved: number;
      hasActivity: boolean;
    }>;
    stats: {
      activeDays: number;
      totalProblemsSolved: number;
      averagePerDay: number;
    };
  };
}
```

---

### **9.4 Get User Streak History**

```http
GET /api/streaks/:userId/history?page=1&limit=30
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    streaks: Array<{
      date: string;
      problemsSolved: number;
    }>;
    pagination: PaginationMeta;
  };
}
```

---

## 10. Leaderboard Module

**Base:** `/api/leaderboard`

### **10.1 Get Global Leaderboard**

```http
GET /api/leaderboard?page=1&limit=100&period=all
```

**Authentication:** Optional (public with rate limit)  
**Authorization:** N/A

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 100, max: 100)
- `period` (enum: 'all' | 'week' | 'month', default: 'all')

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    leaderboard: Array<{
      rank: number;
      user: {
        id: number;
        username: string;
        avatarUrl: string | null;
      };
      reputationScore: number;
      totalPosts: number;
      totalDoubtsAnswered: number;
      totalAcceptedAnswers: number;
      currentStreak: number;
    }>;
    myRank: number | null; // If authenticated
    pagination: PaginationMeta;
  };
}
```

**Caching:** 5 minutes in Redis

---

### **10.2 Get User Rank**

```http
GET /api/leaderboard/:userId
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    rank: number;
    percentile: number; // Top X%
    reputationScore: number;
    rankChange: number; // +/- since last week
    stats: {
      totalPosts: number;
      totalDoubtsAnswered: number;
      totalAcceptedAnswers: number;
      currentStreak: number;
    };
  };
}
```

---

### **10.3 Get Nearby Rankings**

```http
GET /api/leaderboard/me/nearby?range=5
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `range` (number, default: 5, max: 10) - Users above/below

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    leaderboard: Array<LeaderboardEntry>;
    myRank: number;
  };
}
```

---

## 11. Search Module

**Base:** `/api/search`

### **11.1 Global Search**

```http
GET /api/search?q=algorithm&type=all&page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `q` (string, required) - Search query (min 2 chars)
- `type` (enum: 'all' | 'posts' | 'doubts' | 'users', default: 'all')
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    posts: Array<PostDetail>;
    doubts: Array<DoubtDetail>;
    users: Array<UserProfile>;
    counts: {
      posts: number;
      doubts: number;
      users: number;
      total: number;
    };
    pagination: PaginationMeta;
  };
}
```

---

### **11.2 Search Posts**

```http
GET /api/search/posts?q=binary+tree&page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    posts: Array<PostDetail>;
    pagination: PaginationMeta;
  };
}
```

---

### **11.3 Search Doubts**

```http
GET /api/search/doubts?q=dynamic+programming&tags=DP&difficulty=medium
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `q` (string, required)
- `tags` (string, comma-separated)
- `difficulty` (enum: 'easy' | 'medium' | 'hard')
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)

**Response:** Same as Get All Doubts

---

### **11.4 Search Users**

```http
GET /api/search/users?q=john&page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** Same as User Module - Search Users

---

### **11.5 Get Search Suggestions**

```http
GET /api/search/suggestions?q=dyn&type=tags
```

**Authentication:** Required  
**Authorization:** Authenticated

**Query Parameters:**
- `q` (string, required) - Partial query
- `type` (enum: 'tags' | 'users', default: 'tags')

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    suggestions: string[]; // Array of suggestions
  };
}
```

---

## 12. Reports Module

**Base:** `/api/reports`

### **12.1 Report Content**

```http
POST /api/reports
```

**Authentication:** Required  
**Authorization:** Authenticated  
**Rate Limit:** 10 reports/hour

**Request Body:**

```typescript
{
  reportedContentId: number;    // Required
  reportedContentType: 'post' | 'comment' | 'doubt' | 'user';
  reason: string;               // Required, 10-1000 chars
}
```

**Response:** `201 Created`

```typescript
{
  success: true;
  data: {
    id: number;
    reporterId: number;
    reportedContentId: number;
    reportedContentType: string;
    reason: string;
    status: 'pending';
    createdAt: string;
  };
  message: "Report submitted successfully";
}
```

**Errors:**
- `400` - Cannot report own content
- `409` - Already reported
- `429` - Too many reports

---

### **12.2 Get My Reports**

```http
GET /api/reports/me?page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Authenticated

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    reports: Array<{
      id: number;
      reportedContentId: number;
      reportedContentType: string;
      reason: string;
      status: string;
      createdAt: string;
      reviewedAt: string | null;
    }>;
    pagination: PaginationMeta;
  };
}
```

---

### **12.3 Get Moderation Queue** (Admin/Moderator)

```http
GET /api/reports/queue?status=pending&page=1&limit=20
```

**Authentication:** Required  
**Authorization:** Admin or Moderator only

**Query Parameters:**
- `status` (enum: 'pending' | 'reviewed' | 'resolved' | 'dismissed')
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    reports: Array<{
      id: number;
      reporter: {
        id: number;
        username: string;
      };
      reportedContentId: number;
      reportedContentType: string;
      contentPreview: string; // First 200 chars of reported content
      reason: string;
      status: string;
      createdAt: string;
    }>;
    counts: {
      pending: number;
      reviewed: number;
      resolved: number;
      dismissed: number;
    };
    pagination: PaginationMeta;
  };
}
```

---

### **12.4 Get Report Details** (Admin/Moderator)

```http
GET /api/reports/:reportId
```

**Authentication:** Required  
**Authorization:** Admin or Moderator only

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    id: number;
    reporter: UserProfile | null; // null if deleted
    reportedContent: PostDetail | CommentDetail | DoubtDetail | UserProfile;
    reportedContentType: string;
    reason: string;
    status: string;
    reviewedBy: UserProfile | null;
    resolutionNotes: string | null;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### **12.5 Update Report Status** (Admin/Moderator)

```http
PATCH /api/reports/:reportId
```

**Authentication:** Required  
**Authorization:** Admin or Moderator only

**Request Body:**

```typescript
{
  status: 'reviewed' | 'resolved' | 'dismissed';
  resolutionNotes?: string; // Max 1000 chars
  action?: 'delete_content' | 'warn_user' | 'ban_user' | 'none';
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    reportId: number;
    status: string;
    resolutionNotes: string | null;
    reviewedBy: number;
    actionTaken: string | null;
  };
  message: "Report updated successfully";
}
```

**Business Logic:**
- If action = 'delete_content': Deletes reported post/comment/doubt
- If action = 'warn_user': Sends warning notification to user
- If action = 'ban_user': Deactivates user account

---

### **12.6 Bulk Action Reports** (Admin)

```http
POST /api/reports/bulk-action
```

**Authentication:** Required  
**Authorization:** Admin only

**Request Body:**

```typescript
{
  reportIds: number[];       // Max 50
  status: string;
  action?: string;
}
```

**Response:** `200 OK`

```typescript
{
  success: true;
  data: {
    processedCount: number;
    failedCount: number;
  };
  message: "Bulk action completed";
}
```

---

## Data Transfer Objects (DTOs)

### **Common DTOs**

```typescript
// Pagination Metadata
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Cursor Pagination Metadata
interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

// User Basic Info
interface UserBasicDTO {
  id: number;
  username: string;
  avatarUrl: string | null;
}

// User Profile DTO
interface UserProfileDTO extends UserBasicDTO {
  email?: string; // Only if public or owner
  fullName: string | null;
  bio: string | null;
  leetcodeUsername: string | null;
  githubUrl: string | null;
  location: string | null;
  website: string | null;
  currentStreak: number;
  longestStreak: number;
  totalProblemsSolved: number;
  isFollowing: boolean;
  isFollower: boolean;
  stats: UserStatsDTO;
  createdAt: string;
}

// User Stats DTO
interface UserStatsDTO {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  doubtsCount: number;
  answersCount: number;
  reputationScore: number;
  rank: number | null;
}

// Post Detail DTO
interface PostDetailDTO {
  id: number;
  userId: number;
  content: string;
  codeSnippet: string | null;
  language: string | null;
  problemLink: string | null;
  isPinned: boolean;
  author: UserBasicDTO;
  stats: {
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Comment Detail DTO
interface CommentDetailDTO {
  id: number;
  postId: number;
  userId: number;
  content: string;
  parentCommentId: number | null;
  author: UserBasicDTO;
  stats: {
    likesCount: number;
    repliesCount: number;
  };
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Doubt Detail DTO
interface DoubtDetailDTO {
  id: number;
  userId: number;
  title: string;
  content: string;
  tags: string[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  isResolved: boolean;
  viewsCount: number;
  author: UserBasicDTO;
  stats: {
    answersCount: number;
    acceptedAnswerId: number | null;
  };
  createdAt: string;
  updatedAt: string;
}

// Answer Detail DTO
interface AnswerDetailDTO {
  id: number;
  doubtId: number;
  userId: number;
  content: string;
  codeSnippet: string | null;
  isAccepted: boolean;
  author: UserBasicDTO;
  stats: {
    upvotes: number;
    downvotes: number;
    score: number;
  };
  myVote: 'upvote' | 'downvote' | null;
  createdAt: string;
  updatedAt: string;
}

// Message DTO
interface MessageDTO {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// Group Message DTO
interface GroupMessageDTO {
  id: number;
  groupId: number;
  userId: number;
  content: string;
  author: UserBasicDTO;
  createdAt: string;
}

// Notification DTO
interface NotificationDTO {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'answer' | 'message';
  content: string;
  relatedId: number | null;
  relatedType: string | null;
  isRead: boolean;
  actor: UserBasicDTO;
  createdAt: string;
}
```

---

## Validation Rules

### **Input Validation Schema**

```typescript
const validationRules = {
  // User Registration
  registration: {
    email: {
      type: 'string',
      required: true,
      format: 'email',
      maxLength: 255,
      transform: 'lowercase',
      custom: [
        'checkEmailDomain', // Block disposable emails
        'checkEmailUnique'
      ]
    },
    username: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_]+$/,
      custom: [
        'checkUsernameBlacklist',
        'checkUsernameUnique'
      ]
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      custom: ['checkPasswordStrength'] // Entropy check
    },
    fullName: {
      type: 'string',
      optional: true,
      maxLength: 100,
      sanitize: true
    }
  },

  // Post Creation
  postCreation: {
    content: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 5000,
      sanitize: true,
      custom: ['checkProfanity', 'checkSpam']
    },
    codeSnippet: {
      type: 'string',
      optional: true,
      maxLength: 10000,
      sanitize: false // Preserve formatting
    },
    language: {
      type: 'string',
      optional: true,
      enum: [
        'javascript', 'typescript', 'python', 'java',
        'cpp', 'c', 'go', 'rust', 'php', 'ruby',
        'swift', 'kotlin', 'sql', 'bash'
      ]
    },
    problemLink: {
      type: 'string',
      optional: true,
      format: 'url',
      pattern: /^https:\/\/(leetcode\.com|github\.com)/,
      maxLength: 500
    }
  },

  // Doubt Creation
  doubtCreation: {
    title: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 200,
      sanitize: true,
      custom: ['checkProfanity']
    },
    content: {
      type: 'string',
      required: true,
      minLength: 20,
      maxLength: 10000,
      sanitize: true,
      custom: ['checkProfanity', 'checkCodeSnippet']
    },
    tags: {
      type: 'array',
      optional: true,
      maxItems: 5,
      items: {
        type: 'string',
        enum: [
          'Array', 'String', 'Hash Table', 'Dynamic Programming',
          'Math', 'Sorting', 'Greedy', 'Depth-First Search',
          'Binary Search', 'Database', 'Breadth-First Search',
          'Tree', 'Matrix', 'Bit Manipulation', 'Two Pointers',
          'Binary Tree', 'Heap', 'Stack', 'Graph', 'Design',
          'Simulation', 'Backtracking', 'Linked List'
        ]
      }
    },
    difficultyLevel: {
      type: 'string',
      required: true,
      enum: ['easy', 'medium', 'hard']
    }
  },

  // Comment Creation
  commentCreation: {
    postId: {
      type: 'number',
      required: true,
      min: 1,
      custom: ['checkPostExists']
    },
    content: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 2000,
      sanitize: true,
      custom: ['checkProfanity', 'checkSpam']
    },
    parentCommentId: {
      type: 'number',
      optional: true,
      min: 1,
      custom: [
        'checkCommentExists',
        'checkNestingDepth' // Max 3 levels
      ]
    }
  },

  // Message Sending
  messageSending: {
    receiverId: {
      type: 'number',
      required: true,
      min: 1,
      custom: [
        'checkUserExists',
        'checkNotSelf',
        'checkNotBlocked'
      ]
    },
    content: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 5000,
      sanitize: true,
      custom: ['checkProfanity', 'checkSpam']
    }
  },

  // Report Submission
  reportSubmission: {
    reportedContentId: {
      type: 'number',
      required: true,
      min: 1
    },
    reportedContentType: {
      type: 'string',
      required: true,
      enum: ['post', 'comment', 'doubt', 'user']
    },
    reason: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 1000,
      sanitize: true,
      custom: ['checkNotOwnContent']
    }
  }
};
```

### **Custom Validators**

```typescript
// Email domain validator
async function checkEmailDomain(email: string): Promise<boolean> {
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1];
  return !disposableDomains.includes(domain);
}

// Username blacklist
const usernameBlacklist = [
  'admin', 'moderator', 'root', 'system', 'support',
  'help', 'api', 'null', 'undefined', 'test'
];

function checkUsernameBlacklist(username: string): boolean {
  return !usernameBlacklist.includes(username.toLowerCase());
}

// Password strength (zxcvbn library)
function checkPasswordStrength(password: string): boolean {
  const result = zxcvbn(password);
  return result.score >= 3; // Score 3 or 4 (out of 4)
}

// Profanity filter
function checkProfanity(text: string): boolean {
  const profanityList = ['badword1', 'badword2']; // Use library like 'bad-words'
  const lowercaseText = text.toLowerCase();
  return !profanityList.some(word => lowercaseText.includes(word));
}

// Spam detection
function checkSpam(content: string): boolean {
  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) return false;

  // Check for excessive caps
  const capsRatio = content.replace(/[^A-Z]/g, '').length / content.length;
  if (capsRatio > 0.5) return false;

  // Check for repetitive patterns
  const repetitivePattern = /(.)\1{10,}/;
  if (repetitivePattern.test(content)) return false;

  return true;
}

// Nesting depth check
async function checkNestingDepth(
  parentCommentId: number,
  db: Database
): Promise<boolean> {
  let depth = 0;
  let currentId = parentCommentId;

  while (currentId && depth < 4) {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, currentId)
    });
    if (!comment) break;
    currentId = comment.parentCommentId;
    depth++;
  }

  return depth < 3; // Max 3 levels
}
```

---

## Middleware Stack

### **1. Request Logging Middleware**

```typescript
import { v4 as uuidv4 } from 'uuid';

export async function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = uuidv4();
  req.requestId = requestId;

  const startTime = Date.now();

  // Log request
  logger.info({
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id || null
  });

  // Intercept response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;

    logger.info({
      requestId,
      statusCode: res.statusCode,
      duration,
      responseSize: data?.length || 0
    });

    return originalSend.call(this, data);
  };

  next();
}
```

---

### **2. Authentication Middleware (JWT)**

```typescript
import jwt from 'jsonwebtoken';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Check if user exists and is active
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.id, decoded.userId),
        eq(users.isActive, true)
      )
    });

    if (!user) {
      throw new UnauthorizedError('Invalid token');
    }

    // Check token blacklist (Redis)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
    next(error);
  }
}
```

---

### **3. Rate Limiting Middleware**

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  store: new RedisStore({
    client: redis,
    prefix: 'rl:global:'
  }),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: res.getHeader('Retry-After')
      }
    });
  },
  keyGenerator: (req) => {
    return req.user?.id ? `user:${req.user.id}` : req.ip;
  }
});

// Specific rate limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  skipSuccessfulRequests: true
});

export const postCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 posts per hour
  store: new RedisStore({
    client: redis,
    prefix: 'rl:posts:'
  }),
  keyGenerator: (req) => `user:${req.user.id}`
});
```

---

### **4. Input Sanitization Middleware**

```typescript
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = DOMPurify.sanitize(req.query[key] as string);
      }
    }
  }

  // Sanitize body (selective)
  if (req.body) {
    const fieldsToSanitize = ['content', 'bio', 'title', 'reason', 'fullName'];

    for (const field of fieldsToSanitize) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = DOMPurify.sanitize(req.body[field], {
          ALLOWED_TAGS: [], // Strip all HTML
          ALLOWED_ATTR: []
        });
      }
    }

    // Don't sanitize code snippets (preserve formatting)
    // Don't sanitize markdown (handle separately)
  }

  next();
}
```

---

### **5. Authorization Middleware**

```typescript
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }

    next();
  };
}

// Usage:
// app.get('/api/reports/queue', authMiddleware, authorize('admin', 'moderator'), getReportsQueue);
```

---

### **6. Validation Middleware**

```typescript
import { z } from 'zod';

export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        });
      }
      next(error);
    }
  };
}

// Usage:
// app.post('/api/posts', authMiddleware, validate(postCreationSchema), createPost);
```

---

## Error Handling

### **Error Response Format**

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
    path: string;
  };
}
```

### **Error Codes**

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_TOKEN` | 401 | Invalid/expired JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Resource already exists (duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `EXTERNAL_API_ERROR` | 502 | Third-party API error |

### **Global Error Handler**

```typescript
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown',
      path: req.path
    }
  };

  // Handle specific error types
  if (err instanceof ValidationError) {
    errorResponse.error.code = 'VALIDATION_ERROR';
    errorResponse.error.message = err.message;
    errorResponse.error.details = err.details;
    return res.status(400).json(errorResponse);
  }

  if (err instanceof UnauthorizedError) {
    errorResponse.error.code = 'UNAUTHORIZED';
    errorResponse.error.message = err.message;
    return res.status(401).json(errorResponse);
  }

  if (err instanceof ForbiddenError) {
    errorResponse.error.code = 'FORBIDDEN';
    errorResponse.error.message = err.message;
    return res.status(403).json(errorResponse);
  }

  if (err instanceof NotFoundError) {
    errorResponse.error.code = 'NOT_FOUND';
    errorResponse.error.message = err.message;
    return res.status(404).json(errorResponse);
  }

  if (err instanceof ConflictError) {
    errorResponse.error.code = 'ALREADY_EXISTS';
    errorResponse.error.message = err.message;
    return res.status(409).json(errorResponse);
  }

  // Log error (don't expose internal details to client)
  logger.error({
    requestId: req.requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    user: req.user?.id || null,
    path: req.path
  });

  // Send generic error response
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      name: err.name,
      message: err.message,
      stack: err.stack
    };
  }

  res.status(500).json(errorResponse);
}
```

---

## Pagination Strategy

### **Cursor-Based Pagination** (for Posts, Messages, Comments)

**Why:** Better performance for large datasets, consistent results during data changes

**Implementation:**

```typescript
// Request
GET /api/posts/feed?cursor=2024-01-15T10:30:00.000Z&limit=20

// Response
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {
      "nextCursor": "2024-01-14T08:15:00.000Z", // createdAt of last item
      "hasMore": true
    }
  }
}

// Backend Logic
async function getFeed(userId: number, cursor?: string, limit: number = 20) {
  const posts = await db
    .select()
    .from(posts)
    .where(
      and(
        cursor ? lt(posts.createdAt, cursor) : undefined,
        // ... other conditions
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit + 1); // Fetch one extra to check if more exists

  const hasMore = posts.length > limit;
  const results = hasMore ? posts.slice(0, limit) : posts;

  return {
    posts: results,
    pagination: {
      nextCursor: hasMore ? results[results.length - 1].createdAt : null,
      hasMore
    }
  };
}
```

**Advantages:**
- O(1) performance regardless of offset
- No duplicate/missing items during concurrent writes
- Scales to millions of rows

---

### **Page-Based Pagination** (for Doubts, Users, Reports)

**Why:** Easier to implement total count, page numbers

**Implementation:**

```typescript
// Request
GET /api/doubts?page=2&limit=20

// Response
{
  "success": true,
  "data": {
    "doubts": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": true
    }
  }
}

// Backend Logic
async function getDoubts(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const [results, [{ count }]] = await Promise.all([
    db.select().from(doubts).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(doubts)
  ]);

  return {
    doubts: results,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrev: page > 1
    }
  };
}
```

---

## Sample Requests & Responses

### **1. Create Post**

**Request:**

```bash
curl -X POST https://api.leetsocial.com/v1/api/posts \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Just solved the Two Sum problem! Here'\''s my optimized solution:",
    "codeSnippet": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    "language": "javascript",
    "problemLink": "https://leetcode.com/problems/two-sum/"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 12345,
    "userId": 789,
    "content": "Just solved the Two Sum problem! Here's my optimized solution:",
    "codeSnippet": "function twoSum(nums, target) {...}",
    "language": "javascript",
    "problemLink": "https://leetcode.com/problems/two-sum/",
    "isPinned": false,
    "author": {
      "id": 789,
      "username": "johndoe",
      "avatarUrl": "https://cdn.leetsocial.com/avatars/789.jpg"
    },
    "stats": {
      "likesCount": 0,
      "commentsCount": 0,
      "bookmarksCount": 0
    },
    "isLiked": false,
    "isBookmarked": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Post created successfully"
}
```

---

### **2. Send Direct Message**

**Request:**

```bash
curl -X POST https://api.leetsocial.com/v1/api/chat/messages \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": 456,
    "content": "Hey! I saw your solution to the Binary Tree problem. Really clever approach!"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 78901,
    "senderId": 789,
    "receiverId": 456,
    "content": "Hey! I saw your solution to the Binary Tree problem. Really clever approach!",
    "isRead": false,
    "createdAt": "2024-01-15T10:35:00.000Z"
  },
  "message": "Message sent successfully"
}
```

---

### **3. Ask Doubt**

**Request:**

```bash
curl -X POST https://api.leetsocial.com/v1/api/doubts \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to optimize space complexity in DP problems?",
    "content": "I'\''m solving a coin change problem and my solution uses O(n*m) space. Is there a way to reduce it to O(m) while maintaining the same time complexity?\n\nHere'\''s my current approach:\n```python\ndp = [[0] * (amount + 1) for _ in range(len(coins) + 1)]\n```",
    "tags": ["Dynamic Programming", "Space Optimization"],
    "difficultyLevel": "medium"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 5678,
    "userId": 789,
    "title": "How to optimize space complexity in DP problems?",
    "content": "I'm solving a coin change problem...",
    "tags": ["Dynamic Programming", "Space Optimization"],
    "difficultyLevel": "medium",
    "isResolved": false,
    "viewsCount": 0,
    "author": {
      "id": 789,
      "username": "johndoe",
      "avatarUrl": "https://cdn.leetsocial.com/avatars/789.jpg"
    },
    "stats": {
      "answersCount": 0,
      "acceptedAnswerId": null
    },
    "createdAt": "2024-01-15T10:40:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "message": "Doubt created successfully"
}
```

---

### **4. Answer Doubt**

**Request:**

```bash
curl -X POST https://api.leetsocial.com/v1/api/doubts/5678/answers \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Yes! You can optimize to O(m) space by using only a 1D array instead of 2D. The key insight is that you only need the previous row to compute the current row.\n\nHere'\''s the optimized version:",
    "codeSnippet": "def coinChange(coins, amount):\n    dp = [float('\''inf'\'')] * (amount + 1)\n    dp[0] = 0\n    \n    for coin in coins:\n        for i in range(coin, amount + 1):\n            dp[i] = min(dp[i], dp[i - coin] + 1)\n    \n    return dp[amount] if dp[amount] != float('\''inf'\'') else -1"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 9012,
    "doubtId": 5678,
    "userId": 456,
    "content": "Yes! You can optimize to O(m) space...",
    "codeSnippet": "def coinChange(coins, amount):...",
    "isAccepted": false,
    "author": {
      "id": 456,
      "username": "janedoe",
      "avatarUrl": "https://cdn.leetsocial.com/avatars/456.jpg"
    },
    "stats": {
      "upvotes": 0,
      "downvotes": 0,
      "score": 0
    },
    "myVote": null,
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  },
  "message": "Answer submitted successfully"
}
```

---

### **5. Follow User**

**Request:**

```bash
curl -X POST https://api.leetsocial.com/v1/api/users/456/follow \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "followerId": 789,
    "followingId": 456,
    "createdAt": "2024-01-15T10:50:00.000Z"
  },
  "message": "User followed successfully"
}
```

---

### **6. Retrieve Feed**

**Request:**

```bash
curl -X GET "https://api.leetsocial.com/v1/api/posts/feed?limit=5" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 12350,
        "userId": 456,
        "content": "Just got accepted on a hard problem after 10 attempts! 🎉",
        "codeSnippet": null,
        "language": null,
        "problemLink": null,
        "isPinned": false,
        "author": {
          "id": 456,
          "username": "janedoe",
          "avatarUrl": "https://cdn.leetsocial.com/avatars/456.jpg"
        },
        "stats": {
          "likesCount": 24,
          "commentsCount": 7,
          "bookmarksCount": 3
        },
        "isLiked": false,
        "isBookmarked": false,
        "createdAt": "2024-01-15T10:55:00.000Z",
        "updatedAt": "2024-01-15T10:55:00.000Z"
      },
      {
        "id": 12345,
        "userId": 789,
        "content": "Just solved the Two Sum problem! Here's my optimized solution:",
        "codeSnippet": "function twoSum(nums, target) {...}",
        "language": "javascript",
        "problemLink": "https://leetcode.com/problems/two-sum/",
        "isPinned": false,
        "author": {
          "id": 789,
          "username": "johndoe",
          "avatarUrl": "https://cdn.leetsocial.com/avatars/789.jpg"
        },
        "stats": {
          "likesCount": 12,
          "commentsCount": 3,
          "bookmarksCount": 5
        },
        "isLiked": true,
        "isBookmarked": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "nextCursor": "2024-01-15T10:30:00.000Z",
      "hasMore": true
    }
  }
}
```

---

### **7. Get Leaderboard**

**Request:**

```bash
curl -X GET "https://api.leetsocial.com/v1/api/leaderboard?limit=10" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": 123,
          "username": "codewizard",
          "avatarUrl": "https://cdn.leetsocial.com/avatars/123.jpg"
        },
        "reputationScore": 15420,
        "totalPosts": 234,
        "totalDoubtsAnswered": 187,
        "totalAcceptedAnswers": 142,
        "currentStreak": 87
      },
      {
        "rank": 2,
        "user": {
          "id": 456,
          "username": "janedoe",
          "avatarUrl": "https://cdn.leetsocial.com/avatars/456.jpg"
        },
        "reputationScore": 12350,
        "totalPosts": 189,
        "totalDoubtsAnswered": 156,
        "totalAcceptedAnswers": 98,
        "currentStreak": 45
      },
      {
        "rank": 3,
        "user": {
          "id": 789,
          "username": "johndoe",
          "avatarUrl": "https://cdn.leetsocial.com/avatars/789.jpg"
        },
        "reputationScore": 9870,
        "totalPosts": 145,
        "totalDoubtsAnswered": 89,
        "totalAcceptedAnswers": 67,
        "currentStreak": 23
      }
    ],
    "myRank": 3,
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50000,
      "totalPages": 5000,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## WebSocket Events

### **Real-Time Features**

```typescript
// Connection
const socket = io('wss://api.leetsocial.com', {
  auth: {
    token: 'Bearer eyJhbGc...'
  }
});

// Events
socket.on('new_message', (data: MessageDTO) => {
  // Handle new direct message
});

socket.on('new_group_message', (data: GroupMessageDTO) => {
  // Handle new group message
});

socket.on('new_notification', (data: NotificationDTO) => {
  // Handle new notification
});

socket.on('user_online', (data: { userId: number }) => {
  // User came online
});

socket.on('user_offline', (data: { userId: number }) => {
  // User went offline
});

// Emit typing indicator
socket.emit('typing', { receiverId: 456 });
```

---

## API Versioning

**URL Versioning:** `/api/v1/...`

**Deprecation Process:**
1. Announce deprecation 6 months in advance
2. Add `Deprecation` header to responses
3. Maintain old version for 12 months
4. Redirect to new version with warnings
5. Sunset old version

---

## Summary

✅ **87 API endpoints** covering all modules  
✅ **Complete DTOs** for all entities  
✅ **Validation rules** with custom validators  
✅ **Middleware stack** (Auth, Rate Limiting, Logging, Sanitization)  
✅ **Error handling** with detailed codes  
✅ **Pagination strategies** (Cursor + Page-based)  
✅ **Sample requests/responses** for key operations  
✅ **WebSocket support** for real-time features  

**Your API is production-ready!** 🚀

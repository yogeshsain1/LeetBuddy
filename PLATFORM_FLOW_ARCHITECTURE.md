# 🌊 LeetSocial Platform - Complete Flow Architecture

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│  http://localhost:3000                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 NEXT.JS MIDDLEWARE                           │
│  • Checks authentication (session)                           │
│  • Applies security headers                                  │
│  • Routes: Public vs Protected                               │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
   PUBLIC ROUTES     PROTECTED ROUTES
   • /               • /friends
   • /login          • /messages
   • /signup         • /leaderboard
                     • /settings
                     • (requires auth)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS APP ROUTER (React 19)                   │
│  src/app/[page]/page.tsx                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
   CLIENT-SIDE       SERVER-SIDE
   Components        API Routes
   (React Query)     /api/*
        │                 │
        └────────┬────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  • Better Auth (user table)                                  │
│  • Drizzle ORM + SQLite/Turso                               │
│  • Friendships, Messages, Activities                         │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              REAL-TIME LAYER (Socket.io)                     │
│  http://localhost:3001                                       │
│  • Chat messages                                             │
│  • Online status                                             │
│  • Typing indicators                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Complete User Journey Flow

### 1. Landing Page Flow (/)

```
User visits http://localhost:3000
         ↓
Middleware: No auth required (public route)
         ↓
src/app/page.tsx loads
         ↓
┌─────────────────────────────────────────┐
│  LANDING PAGE COMPONENTS                 │
│  • Animated hero section                 │
│  • Feature cards (Friends, Chat, Rank)   │
│  • CTA buttons (Get Started, Login)      │
│  • Stats showcase                         │
│  • Theme toggle (light/dark)             │
└─────────────────────────────────────────┘
         ↓
User clicks "Get Started"
         ↓
Navigate to /signup
```

### 2. Authentication Flow (/signup → /login)

```
SIGNUP FLOW:
─────────────
User → /signup → src/app/(auth)/signup/page.tsx
         ↓
Form inputs:
  • Full Name
  • Username (unique) ← NEW FIELD
  • Email
  • Password
  • LeetCode Username (optional) ← NEW FIELD
         ↓
Submit → POST /api/auth/sign-up/email (Better Auth)
         ↓
Better Auth creates user:
  • Generates string ID
  • Stores in `user` table with:
    - name, email, username, leetcodeUsername
    - emailVerified, image, createdAt, updatedAt
         ↓
Session created (cookie-based)
         ↓
Redirect to /messages


LOGIN FLOW:
───────────
User → /login → src/app/(auth)/login/page.tsx
         ↓
Form inputs: Email + Password
         ↓
Submit → POST /api/auth/sign-in/email (Better Auth)
         ↓
Better Auth validates credentials
         ↓
Session created
         ↓
Redirect to /messages
```

### 3. Friends System Flow (/friends)

```
User clicks Friends in navigation
         ↓
Middleware: Check auth → session exists?
         ↓ YES
src/app/friends/page.tsx loads
         ↓
┌──────────────────────────────────────────────────┐
│  FRIENDS PAGE COMPONENTS & DATA FLOW              │
├──────────────────────────────────────────────────┤
│                                                   │
│  1. FETCH FRIEND REQUESTS                         │
│     GET /api/friend-requests?type=all             │
│     ↓                                             │
│     src/app/api/friend-requests/route.ts          │
│     ↓                                             │
│     Queries `friendships` table:                  │
│     • WHERE status = 'pending'                    │
│     • Joins with `user` table                     │
│     • Gets username, avatar, bio                  │
│     ↓                                             │
│     Returns: {received: [], sent: []}             │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  2. FETCH FRIENDS LIST                            │
│     GET /api/friends?action=friends               │
│     ↓                                             │
│     src/lib/friends.ts → getUserFriends()         │
│     ↓                                             │
│     Queries `friendships` table:                  │
│     • WHERE status = 'accepted'                   │
│     • Bidirectional check (requester/addressee)  │
│     • Joins with `user` table                     │
│     ↓                                             │
│     Returns: [{id, username, avatar, bio}]        │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  3. SEARCH USERS                                  │
│     User types in search bar                      │
│     ↓ (debounced)                                 │
│     GET /api/users/search?q=yogeshsain054         │
│     ↓                                             │
│     src/app/api/users/search/route.ts             │
│     ↓                                             │
│     Searches `user` table WHERE:                  │
│     • username LIKE '%query%' OR                  │
│     • name LIKE '%query%' OR                      │
│     • leetcodeUsername LIKE '%query%'             │
│     ↓                                             │
│     For each result, checks `friendships`:        │
│     • Already friends?                            │
│     • Request pending?                            │
│     • Request sent?                               │
│     ↓                                             │
│     Returns: [{user, friendshipStatus}]           │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  4. SEND FRIEND REQUEST                           │
│     User clicks "Add Friend"                      │
│     ↓                                             │
│     POST /api/friend-requests                     │
│     Body: {addresseeId: "user-string-id"}         │
│     ↓                                             │
│     src/lib/friends.ts → sendFriendRequest()      │
│     ↓                                             │
│     INSERT INTO friendships:                      │
│     • requesterId (current user ID - string)      │
│     • addresseeId (target user ID - string)       │
│     • status: 'pending'                           │
│     • requestedAt: timestamp                      │
│     ↓                                             │
│     UI updates → "Request Sent"                   │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  5. ACCEPT FRIEND REQUEST                         │
│     User clicks "Accept"                          │
│     ↓                                             │
│     POST /api/friend-requests                     │
│     Body: {action: 'accept', friendshipId: 123}   │
│     ↓                                             │
│     src/lib/friends.ts → acceptFriendRequest()    │
│     ↓                                             │
│     UPDATE friendships SET:                       │
│     • status = 'accepted'                         │
│     • respondedAt = timestamp                     │
│     WHERE id = friendshipId                       │
│     ↓                                             │
│     UI updates → Friend added to list             │
│                                                   │
└──────────────────────────────────────────────────┘
```

### 4. Real-Time Messaging Flow (/messages)

```
User navigates to /messages
         ↓
Middleware: Check auth
         ↓
src/app/messages/page.tsx loads
         ↓
┌────────────────────────────────────────────────────┐
│  MESSAGES PAGE - TWO-SERVER ARCHITECTURE            │
├────────────────────────────────────────────────────┤
│                                                     │
│  SERVER 1: NEXT.JS (Port 3000)                     │
│  ────────────────────────────                      │
│  1. Fetch chat rooms                                │
│     GET /api/rooms                                  │
│     ↓                                               │
│     src/app/api/rooms/route.ts                      │
│     ↓                                               │
│     Queries:                                        │
│     • message_rooms table                           │
│     • Joins room_members                            │
│     • Joins user table (CAST ID to match)          │
│     ↓                                               │
│     Returns: [{roomId, otherUser, lastMessage}]    │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  SERVER 2: SOCKET.IO (Port 3001)                   │
│  ───────────────────────────────                   │
│  2. Establish WebSocket connection                  │
│     SocketContext connects to ws://localhost:3001   │
│     ↓                                               │
│     src/socket/server.ts                            │
│     ↓                                               │
│     Socket.io events:                               │
│     • connection                                    │
│     • join_room                                     │
│     • send_message                                  │
│     • typing_start                                  │
│     • typing_stop                                   │
│     • disconnect                                    │
│                                                     │
│  3. USER SENDS MESSAGE                              │
│     User types & hits Enter                         │
│     ↓                                               │
│     Client emits: socket.emit('send_message', {})   │
│     ↓                                               │
│     Server receives in socket/server.ts             │
│     ↓                                               │
│     src/socket/services/message.service.ts          │
│     ↓                                               │
│     createMessage() function:                       │
│     • Validates user is room member                 │
│     • INSERT INTO room_messages                     │
│     • Gets sender info from user table              │
│     • UPDATE room's lastMessageAt                   │
│     ↓                                               │
│     Server emits: io.to(roomId).emit('new_message') │
│     ↓                                               │
│     All clients in room receive instantly           │
│     ↓                                               │
│     React state updates → Message appears           │
│                                                     │
│  4. TYPING INDICATORS                               │
│     User starts typing                              │
│     ↓                                               │
│     Emit: socket.emit('typing_start', {roomId})     │
│     ↓                                               │
│     Server broadcasts to room                       │
│     ↓                                               │
│     Other users see "User is typing..."            │
│     ↓                                               │
│     After 3s idle → emit('typing_stop')             │
│                                                     │
│  5. ONLINE STATUS                                   │
│     Socket connection established                   │
│     ↓                                               │
│     Server tracks: onlineUsers Map<userId, socketId>│
│     ↓                                               │
│     Emits: 'user_online' to all friends             │
│     ↓                                               │
│     Green dot appears next to user                  │
│                                                     │
└────────────────────────────────────────────────────┘
```

### 5. Leaderboard Flow (/leaderboard)

```
User → /leaderboard
         ↓
src/app/leaderboard/page.tsx
         ↓
┌─────────────────────────────────────┐
│  USER SELECTS SCOPE                  │
│  • Global (all users)                │
│  • Friends (my friends only)         │
└────────────┬────────────────────────┘
             ↓
GET /api/leaderboard?scope=global|friends
         ↓
src/app/api/leaderboard/route.ts
         ↓
IF scope === 'friends':
  1. Get current user's friend IDs
     • Query friendships WHERE status='accepted'
     • Bidirectional (requester + addressee)
  2. Query user table WHERE id IN friendIds
ELSE (global):
  Query all users
         ↓
JOIN with leetcode_stats table
  • user.id = leetcodeStats.userId
  • Gets: totalSolved, easyCount, mediumCount, hardCount
         ↓
ORDER BY totalSolved DESC
LIMIT 100
         ↓
Returns: [{id, username, avatar, stats}]
         ↓
Frontend renders:
  • Top 3 users → Podium cards (gold/silver/bronze)
  • Rest → Table with rank, username, problems solved
  • Animated entrance (framer-motion)
```

### 6. Activity Feed Flow (/activity)

```
User → /activity
         ↓
src/app/activity/page.tsx
         ↓
┌─────────────────────────────────────┐
│  USER SELECTS FILTER                 │
│  • All (everyone's activities)       │
│  • Friends (my friends only)         │
└────────────┬────────────────────────┘
             ↓
GET /api/activities?filter=all|friends
         ↓
src/app/api/activities/route.ts
         ↓
IF filter === 'friends':
  Get friend IDs → Filter activities
ELSE:
  Get all activities
         ↓
Query user_activities table
  • JOIN with user table
  • Gets: activityType, title, description, timestamp
         ↓
ORDER BY createdAt DESC
LIMIT 50
         ↓
Returns: [{
  id, username, avatar,
  type: 'problem_solved' | 'streak_milestone' | 'friend_added',
  title: "Solved Two Sum",
  description: "Easy • Arrays • Hash Table",
  createdAt: timestamp
}]
         ↓
Frontend renders:
  • Staggered card animations
  • Activity icons (trophy, fire, user)
  • Time ago (1h ago, 2d ago)
  • Like/comment buttons
```

---

## 🔐 Authentication & Session Management

### Better Auth Flow

```
┌────────────────────────────────────────────────┐
│  BETTER AUTH CONFIGURATION                      │
│  src/lib/auth.ts                                │
├────────────────────────────────────────────────┤
│                                                 │
│  export const auth = betterAuth({               │
│    database: drizzleAdapter(db),                │
│    emailAndPassword: { enabled: true },         │
│    session: {                                   │
│      expiresIn: 7 days,                         │
│      cookieCache: true                          │
│    },                                           │
│    user: {                                      │
│      additionalFields: {                        │
│        username: { type: 'string', unique },    │
│        leetcodeUsername: { type: 'string' },    │
│        bio, location, githubUrl, website        │
│      }                                          │
│    }                                            │
│  })                                             │
└────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│  DATABASE TABLES                                │
├────────────────────────────────────────────────┤
│  • user (Better Auth primary table)             │
│    - id: string (UUID)                          │
│    - name: string                               │
│    - email: string (unique)                     │
│    - username: string (unique) ← NEW            │
│    - leetcodeUsername: string ← NEW             │
│    - emailVerified: boolean                     │
│    - image: string                              │
│                                                 │
│  • session                                      │
│    - id, token, userId, expiresAt              │
│                                                 │
│  • account (OAuth providers)                    │
│    - GitHub, Google (future)                    │
└────────────────────────────────────────────────┘
         ↓
SESSION CHECK IN MIDDLEWARE:
  const session = await auth.api.getSession({
    headers: request.headers
  })
  
  if (!session?.user) → Redirect to /login
  else → Allow access to protected route
```

---

## 🗄️ Database Schema & Relationships

```sql
-- BETTER AUTH TABLES (String IDs)
user
├── id (string PK)
├── name
├── email (unique)
├── username (unique) ← SEARCH KEY
├── leetcodeUsername ← SEARCH KEY
└── image

-- FRIENDSHIPS (String Foreign Keys)
friendships
├── id (int PK)
├── requesterId (string FK → user.id)
├── addresseeId (string FK → user.id)
├── status ('pending' | 'accepted' | 'rejected')
└── timestamps

-- MESSAGES
message_rooms
├── id (int PK)
├── type ('direct' | 'group')
└── lastMessageAt

room_members
├── roomId (int FK → message_rooms)
├── userId (int) ← CAST from user.id string
└── isPinned, isMuted

room_messages
├── id (int PK)
├── roomId (int FK)
├── senderId (int) ← CAST from user.id
├── content (text)
├── type ('text' | 'image' | 'file' | 'code')
└── timestamps

-- ACTIVITIES
user_activities
├── id (int PK)
├── userId (string FK → user.id)
├── activityType
├── title, description
└── createdAt

-- LEETCODE STATS
leetcode_stats
├── id (int PK)
├── userId (int FK)
├── easyCount, mediumCount, hardCount
├── totalSolved
├── contestRating
└── currentStreak
```

---

## 🎨 Frontend Component Tree

```
App Layout (src/app/layout.tsx)
│
├── ThemeProvider (light/dark mode)
│
├── Providers (React Query)
│
├── SocketProvider (WebSocket connection)
│
├── AuthContext (user session)
│
└── Page Components
    │
    ├── Home (/) - Landing page
    │   ├── Hero section
    │   ├── Feature cards
    │   └── CTA buttons
    │
    ├── Auth Pages
    │   ├── /login
    │   └── /signup
    │
    ├── Friends (/friends)
    │   ├── Tabs (All, Pending, Suggestions)
    │   ├── Search bar → useUserSearch hook
    │   ├── Friend cards (animated)
    │   └── Request actions (Accept/Reject)
    │
    ├── Messages (/messages)
    │   ├── ChatSidebar (room list)
    │   ├── ChatRoom (active conversation)
    │   ├── Message bubbles
    │   └── Typing indicator
    │
    ├── Leaderboard (/leaderboard)
    │   ├── Scope selector (Global/Friends)
    │   ├── Podium (Top 3)
    │   └── Rankings table
    │
    ├── Activity (/activity)
    │   ├── Filter (All/Friends)
    │   └── Activity cards (staggered animation)
    │
    ├── Groups (/groups)
    │   ├── Study group cards
    │   └── Join/Leave buttons
    │
    └── Settings (/settings)
        ├── Profile settings
        ├── Privacy settings
        └── Notification preferences
```

---

## 🔄 Data Flow Patterns

### React Query Pattern (Used throughout)

```typescript
// Example: Friends page
const { data: friends, isLoading } = useQuery({
  queryKey: ['friends'],
  queryFn: async () => {
    const res = await fetch('/api/friends?action=friends')
    return res.json()
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true
})

// Mutations for actions
const sendRequest = useMutation({
  mutationFn: (userId: string) => 
    fetch('/api/friend-requests', {
      method: 'POST',
      body: JSON.stringify({ addresseeId: userId })
    }),
  onSuccess: () => {
    queryClient.invalidateQueries(['friends'])
    toast.success('Friend request sent!')
  }
})
```

### Socket.io Pattern (Real-time)

```typescript
// Context: src/contexts/SocketContext.tsx
const socket = io('http://localhost:3001')

// Join room
socket.emit('join_room', { roomId })

// Send message
socket.emit('send_message', {
  roomId,
  content: 'Hello!',
  type: 'text'
})

// Listen for new messages
socket.on('new_message', (message) => {
  setMessages(prev => [...prev, message])
})
```

---

## 🚦 Request/Response Flow Example

### Complete Flow: Sending a Friend Request

```
1. USER ACTION
   User clicks "Add Friend" button
         ↓
2. CLIENT-SIDE (React)
   onClick handler → useMutation hook
         ↓
3. HTTP REQUEST
   POST http://localhost:3000/api/friend-requests
   Headers: { Cookie: session-token }
   Body: { addresseeId: "user-abc-123" }
         ↓
4. MIDDLEWARE (src/middleware.ts)
   • Path starts with /api/ → Skip auth for API routes
   • Apply security headers (CORS, CSP, etc.)
         ↓
5. API ROUTE (src/app/api/friend-requests/route.ts)
   • Validate session: auth.api.getSession()
   • Extract current user ID from session
         ↓
6. HELPER FUNCTION (src/lib/friends.ts)
   • sendFriendRequest(requesterId, addresseeId)
   • Check if already friends
   • Check if request already exists
         ↓
7. DATABASE WRITE (Drizzle ORM)
   INSERT INTO friendships (
     requester_id,
     addressee_id,
     status,
     requested_at,
     created_at,
     updated_at
   ) VALUES (
     'current-user-id',
     'user-abc-123',
     'pending',
     NOW(),
     NOW(),
     NOW()
   )
         ↓
8. API RESPONSE
   {
     success: true,
     message: 'Friend request sent'
   }
         ↓
9. CLIENT UPDATE (React Query)
   • onSuccess callback fires
   • Invalidate ['friends'] query cache
   • Refetch friend requests
   • Show toast notification
         ↓
10. UI UPDATE
    Button changes: "Add Friend" → "Request Sent"
    Gray/disabled styling applied
```

---

## 🎯 Key Technical Decisions

### Why Two Servers?

1. **Next.js Server (Port 3000)**: Handles HTTP requests, SSR, API routes
2. **Socket.io Server (Port 3001)**: Handles WebSocket connections for real-time features

This separation allows:
- Better scalability (can scale WebSocket server independently)
- Cleaner code organization
- Prevents Next.js serverless function timeouts with long-lived connections

### Why Better Auth?

- Built for modern React/Next.js
- TypeScript-first with type safety
- Session management with cookies
- Extensible with additional fields
- Works seamlessly with Drizzle ORM

### Why String IDs for Users?

- Better Auth uses UUID strings for user IDs
- More secure (harder to enumerate users)
- Standard practice for distributed systems
- Allows easier integration with OAuth providers

### Why React Query?

- Automatic caching and background refetching
- Optimistic updates for better UX
- Loading and error states handled automatically
- Reduces boilerplate code significantly

---

## 📁 Project File Structure

```
leetsocial-platform-blueprint/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Auth group routes
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/[...all]/        # Better Auth endpoints
│   │   │   ├── friends/route.ts
│   │   │   ├── friend-requests/route.ts
│   │   │   ├── users/search/route.ts
│   │   │   ├── leaderboard/route.ts
│   │   │   ├── activities/route.ts
│   │   │   └── rooms/route.ts
│   │   ├── friends/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── activity/page.tsx
│   │   ├── groups/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── community/page.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css
│   │
│   ├── components/                   # React Components
│   │   ├── ui/                       # Shadcn/UI components (45+)
│   │   ├── AnimatedCounter.tsx
│   │   ├── PageTransition.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Providers.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   │
│   ├── contexts/                     # React Contexts
│   │   ├── AuthContext.tsx
│   │   └── SocketContext.tsx
│   │
│   ├── hooks/                        # Custom Hooks
│   │   ├── use-animations.ts
│   │   ├── use-friend-requests.ts
│   │   ├── use-friends.ts
│   │   ├── use-user-search.ts
│   │   └── use-mobile.ts
│   │
│   ├── lib/                          # Utility Functions
│   │   ├── auth.ts                   # Better Auth config
│   │   ├── friends.ts                # Friend system helpers
│   │   ├── api-response.ts           # API standardization
│   │   ├── validation.ts             # Zod schemas
│   │   ├── rate-limit.ts             # Rate limiting
│   │   ├── security.ts               # Security headers
│   │   ├── sanitize.ts               # Input sanitization
│   │   ├── performance.ts            # Performance utils
│   │   ├── animations.ts             # Animation variants
│   │   ├── query-client.ts           # React Query config
│   │   └── utils.ts                  # General utilities
│   │
│   ├── db/                           # Database
│   │   ├── index.ts                  # DB connection
│   │   ├── schema.ts                 # Main schema
│   │   └── schema/
│   │       ├── auth.ts               # Better Auth tables
│   │       └── messages.ts           # Message tables
│   │
│   ├── socket/                       # Socket.io Server
│   │   ├── server.ts                 # Main Socket.io server
│   │   └── services/
│   │       └── message.service.ts    # Message handlers
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── tests/
│   ├── unit/                         # Vitest unit tests
│   └── e2e/                          # Playwright E2E tests
│
├── drizzle/                          # Database migrations
├── public/                           # Static assets
├── server.js                         # Dual server runner
├── drizzle.config.ts                 # Drizzle configuration
├── next.config.ts                    # Next.js config
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── vitest.config.ts                  # Vitest config
├── playwright.config.ts              # Playwright config
└── package.json                      # Dependencies
```

---

## 🔧 API Endpoints Reference

### Authentication
- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Login user
- `POST /api/auth/sign-out` - Logout user
- `GET /api/auth/session` - Get current session

### Friends System
- `GET /api/friends?action=friends` - Get friends list
- `GET /api/friends?action=pending` - Get pending requests
- `POST /api/friends` - Send friend request
- `DELETE /api/friends` - Remove friend

### Friend Requests
- `GET /api/friend-requests?type=received` - Received requests
- `GET /api/friend-requests?type=sent` - Sent requests
- `GET /api/friend-requests?type=all` - All requests
- `POST /api/friend-requests` - Accept/Reject request

### User Search
- `GET /api/users/search?q=username` - Search users

### Leaderboard
- `GET /api/leaderboard?scope=global` - Global rankings
- `GET /api/leaderboard?scope=friends` - Friends rankings

### Activities
- `GET /api/activities?filter=all` - All activities
- `GET /api/activities?filter=friends` - Friends activities

### Messaging
- `GET /api/rooms` - Get chat rooms

### Socket.io Events
- `connection` - Client connects
- `join_room` - Join chat room
- `send_message` - Send message
- `typing_start` - Start typing
- `typing_stop` - Stop typing
- `disconnect` - Client disconnects

---

## 🚀 Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start both servers (Next.js + Socket.io)
npm run dev

# Access the application
http://localhost:3000  # Next.js app
http://localhost:3001  # Socket.io server
```

### Environment Variables

```env
# Database
TURSO_CONNECTION_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# OAuth (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## 📊 Performance Optimizations

### Client-Side
- React Query for intelligent caching
- Lazy loading components
- Image optimization with Next.js Image
- Debounced search inputs
- Virtualized lists for long data

### Server-Side
- Edge Runtime for API routes
- Database connection pooling
- Query optimization with indexes
- Rate limiting on API endpoints
- Response compression

### Real-Time
- Socket.io connection pooling
- Room-based message broadcasting
- Graceful Redis degradation
- Heartbeat for connection health

---

## 🔒 Security Features

### Implemented
- ✅ Better Auth session management
- ✅ CSRF protection
- ✅ XSS prevention with input sanitization
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ Rate limiting on API routes
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Middleware authentication checks
- ✅ Zod validation for all inputs
- ✅ Password hashing (Better Auth)

### Best Practices
- Cookie-based sessions (httpOnly, secure)
- String IDs (UUID) for users
- Parameterized queries
- Input validation at multiple layers
- Error boundary for graceful failures

---

## 🎨 Animation System

### Libraries Used
- Framer Motion (page transitions, UI animations)
- Anime.js (number counting, complex animations)
- React Spring (physics-based animations)

### Implemented Animations
- ✅ Landing page hero animations
- ✅ Friends page staggered cards
- ✅ Leaderboard podium entrance
- ✅ Activity feed card animations
- ✅ Page transitions between routes
- ✅ Hover effects on interactive elements
- ⏳ Messages page (pending)

---

This is your complete LeetSocial platform architecture! 🚀

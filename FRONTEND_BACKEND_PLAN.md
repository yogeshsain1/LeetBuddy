# LeetSocial - Frontend & Backend Architecture Plan

## 🎯 Overview
Complete authentication system with modern UI/UX and robust backend architecture for the friend-based social platform.

---

## 🔐 Authentication System Design

### Frontend Architecture

#### **Login Page** (`/login`)
**Features:**
- Modern glassmorphism design with gradient backgrounds
- Email/password login form
- "Remember me" checkbox
- "Forgot password?" link
- Social login buttons (GitHub, Google)
- Link to signup page
- Form validation with real-time feedback
- Loading states and error messages
- Success animations

**Components:**
```
/src/components/auth/
  ├── LoginForm.tsx          # Main login form
  ├── SocialLoginButtons.tsx # GitHub/Google OAuth
  ├── FormInput.tsx          # Reusable input with validation
  ├── PasswordInput.tsx      # Password with show/hide toggle
  └── AuthLayout.tsx         # Shared layout for auth pages
```

#### **Signup Page** (`/signup`)
**Features:**
- Step-by-step registration wizard
- Email verification
- Password strength indicator
- Username availability check (real-time)
- Profile setup (optional avatar, bio)
- Terms of service acceptance
- Success state with redirect

**Steps:**
1. **Step 1:** Email + Password
2. **Step 2:** Username + Full Name
3. **Step 3:** Profile Picture (optional)
4. **Step 4:** LeetCode Username (optional)
5. **Step 5:** Success & Redirect

#### **Profile Setup** (`/onboarding`)
**First-time user experience:**
- Welcome message
- Quick tutorial of features
- Find friends by username
- Connect LeetCode account
- Set privacy preferences
- Skip/Complete options

### Backend Architecture

#### **Authentication Flow**

```
┌──────────────────────────────────────────────────────────┐
│                     Client (Browser)                      │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│              Next.js API Routes (/api/auth)               │
│  ┌────────────────────────────────────────────────────┐  │
│  │  POST /api/auth/signup    - Create account        │  │
│  │  POST /api/auth/login     - Login                 │  │
│  │  POST /api/auth/logout    - Logout                │  │
│  │  GET  /api/auth/session   - Get session           │  │
│  │  POST /api/auth/verify    - Email verification    │  │
│  │  POST /api/auth/forgot    - Password reset        │  │
│  │  POST /api/auth/reset     - Reset password        │  │
│  │  GET  /api/auth/github    - GitHub OAuth          │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                 Better-Auth (Auth Logic)                  │
│  - Session management                                     │
│  - Password hashing (bcrypt)                              │
│  - Token generation                                       │
│  - OAuth integration                                      │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                  Database (SQLite/Turso)                  │
│  Tables: users, sessions, userSettings                    │
└──────────────────────────────────────────────────────────┘
```

#### **Session Management**
- JWT tokens stored in HTTP-only cookies
- 7-day session expiry
- Automatic refresh on activity
- Secure logout (clear cookies + invalidate token)

#### **Password Security**
- Bcrypt hashing (12 rounds)
- Minimum 8 characters
- Must include: uppercase, lowercase, number, special char
- Password reset via email (time-limited tokens)

#### **Email Verification**
- Send verification email on signup
- 24-hour expiry link
- Resend verification option
- Account limited until verified

---

## 🎨 Frontend Component Architecture

### Page Structure

```
/src/app/
├── (auth)/                    # Auth pages group
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── signup/
│   │   └── page.tsx          # Signup page
│   ├── verify/
│   │   └── page.tsx          # Email verification
│   ├── forgot-password/
│   │   └── page.tsx          # Forgot password
│   └── reset-password/
│       └── page.tsx          # Reset password
│
├── (dashboard)/               # Protected pages group
│   ├── layout.tsx            # Dashboard layout with sidebar
│   ├── home/
│   │   └── page.tsx          # Home feed
│   ├── profile/
│   │   └── [username]/
│   │       └── page.tsx      # User profile
│   ├── friends/
│   │   └── page.tsx          # Friends list
│   ├── messages/
│   │   ├── page.tsx          # Messages overview
│   │   └── [conversationId]/
│   │       └── page.tsx      # Chat conversation
│   ├── groups/
│   │   ├── page.tsx          # Groups list
│   │   └── [groupId]/
│   │       └── page.tsx      # Group chat
│   ├── leaderboard/
│   │   └── page.tsx          # Friend leaderboard
│   ├── activity/
│   │   └── page.tsx          # Activity feed
│   ├── notifications/
│   │   └── page.tsx          # Notifications
│   └── settings/
│       └── page.tsx          # User settings
│
└── onboarding/
    └── page.tsx              # First-time user onboarding
```

### Component Library Structure

```
/src/components/
├── auth/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── SignupWizard.tsx
│   ├── SocialLoginButtons.tsx
│   ├── PasswordStrength.tsx
│   └── AuthLayout.tsx
│
├── dashboard/
│   ├── Sidebar.tsx
│   ├── TopNav.tsx
│   ├── QuickActions.tsx
│   └── UserMenu.tsx
│
├── friends/
│   ├── FriendCard.tsx
│   ├── FriendRequestCard.tsx
│   ├── FriendSearch.tsx
│   └── FriendsList.tsx
│
├── messages/
│   ├── ConversationList.tsx
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   ├── MessageInput.tsx
│   └── EmojiPicker.tsx
│
├── groups/
│   ├── GroupCard.tsx
│   ├── CreateGroupModal.tsx
│   ├── GroupMembersList.tsx
│   └── GroupSettings.tsx
│
├── profile/
│   ├── ProfileHeader.tsx
│   ├── ProfileStats.tsx
│   ├── LeetCodeStats.tsx
│   ├── EditProfileModal.tsx
│   └── ProfileSkeleton.tsx
│
├── leaderboard/
│   ├── LeaderboardTable.tsx
│   ├── LeaderboardFilters.tsx
│   └── UserRankCard.tsx
│
└── ui/                       # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── form.tsx
    └── ...
```

### State Management

**Using React Context + Hooks:**

```
/src/contexts/
├── AuthContext.tsx           # User authentication state
├── FriendsContext.tsx        # Friends list and requests
├── MessagesContext.tsx       # Real-time messages
├── NotificationsContext.tsx  # Notifications
└── ThemeContext.tsx          # Theme preferences
```

**Custom Hooks:**

```
/src/hooks/
├── useAuth.ts               # Authentication helpers
├── useFriends.ts            # Friend operations
├── useMessages.ts           # Messaging
├── useGroups.ts             # Group management
├── useLeaderboard.ts        # Leaderboard data
├── useNotifications.ts      # Notifications
└── useLeetCode.ts           # LeetCode sync
```

---

## 🔧 Backend API Architecture

### API Routes Structure

```
/src/app/api/
├── auth/
│   └── [...all]/
│       └── route.ts         # Better-auth handler
│
├── users/
│   ├── route.ts             # GET all users (search)
│   ├── [username]/
│   │   └── route.ts         # GET user profile
│   └── me/
│       ├── route.ts         # GET/PUT current user
│       └── settings/
│           └── route.ts     # GET/PUT user settings
│
├── friends/
│   ├── route.ts             # GET friends, POST send request
│   ├── requests/
│   │   └── route.ts         # GET pending requests
│   └── [friendshipId]/
│       └── route.ts         # PUT accept/reject, DELETE remove
│
├── messages/
│   ├── route.ts             # GET conversations
│   ├── [conversationId]/
│   │   ├── route.ts         # GET messages, POST new message
│   │   └── read/
│   │       └── route.ts     # PUT mark as read
│   └── typing/
│       └── route.ts         # POST typing indicator
│
├── groups/
│   ├── route.ts             # GET groups, POST create group
│   ├── [groupId]/
│   │   ├── route.ts         # GET/PUT/DELETE group
│   │   ├── members/
│   │   │   └── route.ts     # GET/POST/DELETE members
│   │   ├── messages/
│   │   │   └── route.ts     # GET/POST messages
│   │   └── invite/
│   │       └── route.ts     # POST send invite
│   └── invites/
│       └── route.ts         # GET my invites, PUT accept/decline
│
├── leaderboard/
│   └── route.ts             # GET friend rankings
│
├── activities/
│   └── route.ts             # GET activity feed
│
├── notifications/
│   ├── route.ts             # GET notifications
│   └── read/
│       └── route.ts         # PUT mark as read
│
└── leetcode/
    └── sync/
        └── route.ts         # POST sync LeetCode stats
```

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Middleware Stack

```typescript
// Request Flow
Request 
  → CORS Headers
  → Rate Limiting
  → Authentication Check
  → Route Handler
  → Response
```

**Middleware Files:**
```
/src/lib/middleware/
├── auth.ts              # Check authentication
├── rateLimit.ts         # Rate limiting
├── validation.ts        # Input validation
└── errorHandler.ts      # Error handling
```

---

## 📊 Database Architecture

### Core Tables (Already Created)

```sql
-- Users & Auth
users
leetcodeStats
userSettings

-- Social Features
friendships
directMessages
groups
groupMembers
groupInvitations
groupMessages

-- Activity & Notifications
userActivities
notifications
```

### Indexes for Performance

```sql
-- Friendship lookups
CREATE INDEX idx_friendships_requester ON friendships(requesterId);
CREATE INDEX idx_friendships_addressee ON friendships(addresseeId);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Message lookups
CREATE INDEX idx_messages_sender ON directMessages(senderId);
CREATE INDEX idx_messages_receiver ON directMessages(receiverId);
CREATE INDEX idx_messages_created ON directMessages(createdAt);

-- Group lookups
CREATE INDEX idx_group_members_user ON groupMembers(userId);
CREATE INDEX idx_group_members_group ON groupMembers(groupId);
```

---

## 🎨 UI/UX Design System

### Color Palette

```css
/* Primary Colors */
--orange-500: #f97316;
--yellow-500: #eab308;

/* Neutrals */
--gray-50: #f9fafb;
--gray-900: #111827;
--gray-950: #030712;

/* Semantic Colors */
--success: #10b981;
--error: #ef4444;
--warning: #f59e0b;
--info: #3b82f6;
```

### Typography

```css
/* Headings */
--font-heading: 'Inter', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'Fira Code', monospace;

/* Sizes */
h1: 2.5rem (40px)
h2: 2rem (32px)
h3: 1.5rem (24px)
body: 1rem (16px)
small: 0.875rem (14px)
```

### Spacing System

```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

---

## 🚀 Development Workflow

### Phase 1: Authentication (Current Phase)
- [x] Database schema
- [x] Better-auth setup
- [ ] Create login page UI
- [ ] Create signup wizard UI
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] OAuth integration (GitHub)

### Phase 2: Core Features
- [ ] Friend system UI
- [ ] Profile pages
- [ ] Direct messaging
- [ ] Real-time chat with Socket.io

### Phase 3: Advanced Features
- [ ] Groups system
- [ ] Leaderboard
- [ ] Activity feed
- [ ] Notifications

### Phase 4: Polish
- [ ] Animations & transitions
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization
- [ ] Testing

---

## 🔒 Security Checklist

### Authentication
- [x] Password hashing with bcrypt
- [x] HTTP-only cookies for sessions
- [ ] CSRF protection
- [ ] Rate limiting on login/signup
- [ ] Account lockout after failed attempts
- [ ] Email verification required

### API Security
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Drizzle ORM)
- [ ] XSS prevention
- [ ] Authentication required for protected routes
- [ ] Friendship verification before data access
- [ ] File upload validation & size limits

### Data Privacy
- [x] Profile visibility controls
- [x] Friend-only data access
- [ ] User can delete their account
- [ ] Data export functionality
- [ ] GDPR compliance

---

## 📱 Responsive Design

### Breakpoints
```css
mobile: 0-640px
tablet: 641px-1024px
desktop: 1025px+
```

### Mobile-First Approach
- Stack layouts vertically on mobile
- Bottom navigation for mobile
- Sidebar drawer on mobile
- Touch-friendly buttons (min 44px)
- Swipe gestures for navigation

---

## 🧪 Testing Strategy

### Unit Tests
- Authentication functions
- Friend management functions
- Message functions
- Validation logic

### Integration Tests
- API routes
- Database operations
- Auth flow end-to-end

### E2E Tests
- User signup flow
- Login flow
- Friend request flow
- Messaging flow

---

## 📈 Performance Optimization

### Frontend
- Code splitting by route
- Lazy load images
- Virtual scrolling for long lists
- Debounce search inputs
- Memoize expensive computations
- Optimize bundle size

### Backend
- Database query optimization
- Caching with Redis (optional)
- Pagination for lists
- Rate limiting
- Compress responses

---

## 🛠️ Development Tools

### Required
- Node.js 18+
- npm/pnpm
- Git
- VS Code

### Recommended Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Better Auth Extension (if available)

### Environment Variables
```env
DATABASE_URL=
BETTER_AUTH_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NEXT_PUBLIC_APP_URL=
```

---

## 📝 Next Actions

1. **Create Login Page** with modern design
2. **Create Signup Wizard** with steps
3. **Add Email Verification** flow
4. **Add Password Reset** functionality
5. **Create Onboarding Flow** for new users
6. **Build Dashboard Layout** with sidebar
7. **Implement Friend Search** and requests UI

---

**Last Updated:** November 19, 2025  
**Status:** Architecture & Plan Complete ✅ | Ready for Implementation 🚀

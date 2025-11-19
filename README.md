# 🚀 LeetSocial Platform

> **The Ultimate Social Platform for LeetCode Enthusiasts**

A complete full-stack social networking platform built specifically for the LeetCode community. Connect with fellow coders, discuss algorithms, join study groups, compete on leaderboards, and grow your problem-solving skills together.

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black) ![React](https://img.shields.io/badge/React-19.0.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)

---

## ✨ Features (100% Complete!)

### **All Priority Features Implemented** ✅

✅ **Friend System** - Add friends, manage requests, see online status  
✅ **Direct Messaging** - Real-time chat with read receipts  
✅ **Notifications Center** - Stay updated with all activities  
✅ **Activity Feed** - See what friends are solving in real-time  
✅ **Leaderboard System** - Global/friends rankings with filters  
✅ **Study Groups** - Topic-based rooms (DP, Graphs, Trees)  
✅ **Social Proof** - Endorsements, testimonials, badges  
✅ **User Settings** - Complete profile & privacy management  
✅ **User Directory** - Discover LeetCoders by skill level  
✅ **Profile Analytics** - Comprehensive LeetCode stats  
✅ **Authentication** - Email/password + LeetCode integration  
✅ **Theme System** - Beautiful light/dark mode

---

## 🛠️ Tech Stack

**Frontend:** Next.js 15.3.5 • React 19 • TypeScript 5 • Tailwind CSS v4 • Shadcn/UI  
**Backend:** Better Auth • Drizzle ORM • SQLite • React Query  
**Testing:** Vitest • Playwright • Testing Library  
**Dev Tools:** ESLint • TypeScript • Turbopack

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yogeshsain1/leetsocial-platform-blueprint.git
cd leetsocial-platform-blueprint

# Install dependencies
npm install

# Setup database
npm run db:push

# Run development server
npm run dev

# Run tests
npm test              # Unit tests
npm run test:e2e      # E2E tests

# Open browser
http://localhost:3000
```

---

## 📱 Available Routes

| Route                 | Description      |
| --------------------- | ---------------- |
| `/`                   | Home page        |
| `/login`              | Signup page      |
| `/signin`             | Login page       |
| `/community`          | User directory   |
| `/friends`            | Friend system    |
| `/messages`           | Direct messaging |
| `/groups`             | Study groups     |
| `/activity`           | Activity feed    |
| `/leaderboard`        | Rankings         |
| `/notifications`      | Notifications    |
| `/settings`           | User settings    |
| `/profile/[username]` | User profile     |

---

## 📂 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Login/Signup pages
│   ├── api/               # API routes (auth, friends)
│   └── [pages]/           # Feature pages (15+ routes)
├── components/             # React components
│   ├── ui/                # 45+ Shadcn/UI components
│   ├── ErrorBoundary.tsx  # Error handling
│   └── Providers.tsx      # App providers
├── contexts/              # React Context (Auth)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities
│   ├── api-response.ts    # API standardization
│   ├── validation.ts      # Zod schemas
│   ├── rate-limit.ts      # Rate limiting
│   ├── security.ts        # Security headers
│   ├── sanitize.ts        # Input sanitization
│   ├── performance.ts     # Performance utils
│   └── auth.ts            # Better-auth config
├── db/                    # Database
│   ├── schema.ts          # Drizzle schema
│   └── index.ts           # DB connection
└── middleware.ts          # Auth & security middleware

tests/
├── unit/                  # Vitest unit tests
└── e2e/                   # Playwright E2E tests
```

---

## 🎨 Features Breakdown

### Friend System (`/friends`)

- Send/accept/decline friend requests
- Online status indicators
- Mutual friends count
- Direct message integration

### Direct Messaging (`/messages`)

- Real-time chat interface
- Read receipts & typing indicators
- Pinned conversations
- File attachments (UI ready)

### Activity Feed (`/activity`)

- Problem solved updates
- Contest announcements
- Badge unlocks
- Like/comment system

### Leaderboard (`/leaderboard`)

- Global/friends rankings
- Weekly/monthly filters
- Top 3 podium display
- Rank change tracking

### Study Groups (`/groups`)

- 8+ predefined groups
- Scheduled sessions
- Member management
- Group chat integration

### Social Proof (`/social-proof`)

- Skill endorsements
- User testimonials
- Achievement badges (8+)
- Mentorship program

---

## 🌗 Theme System

- ✅ Light mode
- ✅ Dark mode
- ✅ System preference detection
- ✅ localStorage persistence
- ✅ Smooth transitions

---

## 🔐 Security Features

- **Rate Limiting** - Prevent API abuse with configurable limits
- **Input Sanitization** - XSS and injection protection
- **CSRF Protection** - Token-based validation
- **Security Headers** - CSP, HSTS, X-Frame-Options, etc.
- **Authentication** - Secure session management with better-auth
- **Validation** - Zod schema validation on all inputs
- **Error Handling** - Comprehensive error boundaries

---

## 🚀 Performance Optimizations

- **React Query** - Intelligent data caching and synchronization
- **Code Splitting** - Optimized bundle sizes
- **Lazy Loading** - Images and components on demand
- **Debouncing/Throttling** - Optimized event handling
- **Turbopack** - Fast development builds

---

## 📊 Stats

- **15+ Pages** created
- **50+ Components** built
- **45+ UI Components** from shadcn/ui
- **Production-Ready** - API standardization, validation, security
- **Fully Tested** - Unit & E2E test suites

---

## 📝 Documentation

- `IMPLEMENTATION_PLAN.md` - Complete implementation roadmap
- `FRONTEND_BACKEND_PLAN.md` - Architecture & design system
- `PRODUCTION_READY.md` - Production deployment guide
- `PROJECT_STATUS.md` - Current project status
- `DATABASE_ARCHITECTURE.md` - Database schema design
- `CHAT_ARCHITECTURE.md` - Chat system architecture
- `API_DOCUMENTATION.md` - API endpoints

---

## 📋 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm test                 # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run type-check       # TypeScript type checking
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
```

---

## 🤝 Contributing

Contributions welcome! Fork the repo, create a feature branch, and submit a PR.

---

## 👨‍💻 Author

**Yogesh Sain** - [@yogeshsain1](https://github.com/yogeshsain1)

---

## 📞 Support

For support, open an issue on GitHub.

---

**Made with ❤️ for the LeetCode community**

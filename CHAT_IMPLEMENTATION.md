# LeetSocial Real-Time Chat System

Complete production-ready chat implementation with WebSocket support, presence tracking, read receipts, and rich features.

## 🚀 Features

### Core Features

- ✅ 1:1 Direct Chat
- ✅ Group Chat
- ✅ Online/Offline Status
- ✅ Last Seen Timestamps
- ✅ Read Receipts
- ✅ Message Editing
- ✅ Message Deletion
- ✅ Typing Indicators
- ✅ File/Image Sharing
- ✅ Cursor-based Pagination
- ✅ Rate Limiting
- ✅ Redis Caching
- ✅ Multi-device Support

### Advanced Features

- ⚡ Real-time delivery with Socket.IO
- 📱 React Native mobile support
- 🔒 JWT Authentication
- 🚦 Rate limiting per user
- 💾 Message caching (24h TTL)
- 🔄 Automatic reconnection
- 📊 Presence tracking
- 🎯 Optimistic UI updates
- 🌐 Horizontal scaling with Redis Pub/Sub

---

## 📁 File Structure

```
leetsocial-platform-blueprint/
├── CHAT_ARCHITECTURE.md          # Complete architecture documentation
├── CHAT_IMPLEMENTATION.md         # This file
├── src/
│   ├── db/
│   │   └── schema/
│   │       └── chat.ts            # Drizzle ORM schema
│   ├── backend/
│   │   ├── chat.gateway.ts        # NestJS WebSocket gateway
│   │   ├── chat.service.ts        # Business logic
│   │   └── redis.service.ts       # Redis caching
│   ├── frontend/
│   │   └── ChatRoom.tsx           # React web component
│   └── mobile/
│       └── ChatRoomMobile.tsx     # React Native component
```

---

## 🛠️ Setup Instructions

### Prerequisites

```bash
# Required
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- npm or pnpm
```

### 1. Install Dependencies

```bash
# Backend dependencies
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install ioredis
npm install drizzle-orm pg
npm install @nestjs/jwt @nestjs/passport passport-jwt
npm install uuid

# Frontend dependencies
npm install socket.io-client
npm install react react-dom

# React Native dependencies (mobile)
npm install socket.io-client
npm install react-native
```

### 2. Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/leetsocial

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d

# Socket.IO
SOCKET_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_BUCKET=leetsocial-uploads
```

### 3. Database Setup

```bash
# Run migrations
npm run db:push

# Or generate migration
npm run db:generate
npm run db:migrate
```

### 4. Start Services

```bash
# Start Redis
redis-server

# Start PostgreSQL
pg_ctl start

# Start backend server
npm run start:dev

# Start frontend (separate terminal)
cd frontend && npm run dev

# Start mobile (separate terminal)
cd mobile && npx react-native run-android
# or
cd mobile && npx react-native run-ios
```

---

## 📡 API Usage

### WebSocket Connection

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  auth: {
    token: "your-jwt-token",
  },
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Connected!");
});

socket.on("connection.authenticated", (data) => {
  console.log("Authenticated:", data);
});
```

### Send Message

```typescript
const response = await socket.emitWithAck("message.send", {
  roomId: "direct_user1_user2",
  content: "Hello!",
  type: "text",
  tempId: "temp_123",
});

console.log("Message sent:", response);
```

### Listen for Messages

```typescript
socket.on("message.received", (message) => {
  console.log("New message:", message);
  // Add to UI
});
```

### Typing Indicators

```typescript
// Start typing
socket.emit("typing.start", { roomId: "direct_user1_user2" });

// Stop typing (after 5 seconds or on send)
socket.emit("typing.stop", { roomId: "direct_user1_user2" });

// Listen for typing
socket.on("typing.user", (data) => {
  console.log(`${data.userName} is typing...`);
});
```

### Load Message History

```typescript
const history = await socket.emitWithAck("message.history", {
  roomId: "direct_user1_user2",
  cursor: "2025-11-19T10:30:00Z", // Optional
  limit: 50,
  direction: "before", // or 'after'
});

console.log("Messages:", history.messages);
console.log("Has more:", history.hasMore);
```

### Create Group Chat

```typescript
const response = await socket.emitWithAck("room.create", {
  type: "group",
  name: "Team Chat",
  description: "Our awesome team",
  memberIds: ["user1", "user2", "user3"],
  isPrivate: false,
});

console.log("Room created:", response.room);
```

---

## 🔧 Configuration

### Rate Limiting

Adjust in `redis.service.ts`:

```typescript
const RATE_LIMITS = {
  message: { limit: 10, window: 60 }, // 10 messages per minute
  file: { limit: 5, window: 300 }, // 5 files per 5 minutes
  room_create: { limit: 3, window: 3600 }, // 3 rooms per hour
  typing: { limit: 30, window: 60 }, // 30 typing events per minute
};
```

### Message Cache TTL

In `redis.service.ts`:

```typescript
await this.redis.expire(key, 86400); // 24 hours
```

### Pagination Limits

In `chat.gateway.ts`:

```typescript
limit: data.limit || 50, // Default 50, Max 100
```

---

## 🎯 Usage Examples

### React Web Component

```tsx
import ChatRoom from "@/frontend/ChatRoom";

function App() {
  const token = "your-jwt-token";
  const roomId = "direct_user1_user2";

  return <ChatRoom roomId={roomId} token={token} />;
}
```

### React Native Mobile

```tsx
import ChatRoomMobile from "@/mobile/ChatRoomMobile";

function ChatScreen({ route }) {
  const { roomId, token } = route.params;

  return <ChatRoomMobile roomId={roomId} token={token} />;
}
```

### Custom Hook Usage

```tsx
import { useSocket, useChat } from "@/frontend/ChatRoom";

function MyCustomChat() {
  const { socket, connected } = useSocket(token);
  const { messages, sendMessage, typingUsers } = useChat(socket, roomId);

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.messageId}>{msg.content}</div>
      ))}
      {typingUsers.length > 0 && <p>Someone is typing...</p>}
    </div>
  );
}
```

---

## 🔐 Security

### Authentication

- JWT tokens required for WebSocket connections
- Tokens verified on every connection
- Automatic disconnection on invalid/expired tokens

### Authorization

- Room membership verified before message operations
- User can only edit/delete their own messages
- Admin-only operations for group management

### Rate Limiting

- Per-user rate limits on all operations
- Sliding window algorithm for accuracy
- Automatic cleanup of expired limits

### Data Validation

- Input sanitization on all messages
- File type and size validation
- Content length limits enforced

---

## 📊 Monitoring

### Key Metrics to Track

```typescript
// Metrics to monitor
- Active connections per server
- Messages per second
- Average message latency
- Cache hit rate (Redis)
- Database query time
- Error rate
- Reconnection rate
```

### Health Check Endpoint

```typescript
// Add to your NestJS controller
@Get('/health/chat')
async chatHealth() {
  const redis = await this.redisService.ping();
  const connections = this.chatGateway.server.sockets.sockets.size;

  return {
    status: 'healthy',
    redis: redis === 'PONG' ? 'up' : 'down',
    connections,
    timestamp: new Date().toISOString(),
  };
}
```

---

## 🚀 Production Deployment

### Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: leetsocial
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  chat-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/leetsocial
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

### Nginx Configuration (Load Balancing)

```nginx
upstream chat_servers {
    ip_hash; # Sticky sessions for WebSocket
    server chat-server-1:3001;
    server chat-server-2:3001;
    server chat-server-3:3001;
}

server {
    listen 80;
    server_name chat.leetsocial.com;

    location /socket.io/ {
        proxy_pass http://chat_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Refused

```bash
# Check if services are running
redis-cli ping  # Should return PONG
psql -U postgres -c "SELECT 1"  # Should return 1

# Check ports
netstat -an | grep 3001
netstat -an | grep 6379
```

#### 2. Authentication Fails

```typescript
// Verify JWT token
import jwt from "jsonwebtoken";
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded);
```

#### 3. Messages Not Delivered

```typescript
// Check room membership
const isMember = await chatService.isRoomMember(roomId, userId);
console.log("Is member:", isMember);

// Check Redis cache
const cached = await redis.get(`room:${roomId}:messages`);
console.log("Cached messages:", cached);
```

#### 4. High Latency

```bash
# Check Redis latency
redis-cli --latency

# Check database slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 📚 Additional Resources

- [CHAT_ARCHITECTURE.md](./CHAT_ARCHITECTURE.md) - Complete architecture documentation
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - REST API reference
- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) - Database schema details
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Drizzle ORM](https://orm.drizzle.team/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👥 Support

For issues and questions:

- GitHub Issues: [Create an issue](https://github.com/yogeshsain1/leetsocial-platform-blueprint/issues)
- Email: support@leetsocial.com
- Discord: [Join our community](https://discord.gg/leetsocial)

---

**Built with ❤️ for LeetSocial**

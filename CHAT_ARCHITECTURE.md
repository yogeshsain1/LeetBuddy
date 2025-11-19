# LeetSocial Real-Time Chat Architecture

## Overview

Complete WebSocket-based chat system using Socket.IO with support for 1:1 and group messaging, presence tracking, read receipts, and rich media sharing.

---

## 1. WebSocket Event Naming Conventions

### Connection Events

```
connection.authenticate
connection.authenticated
connection.unauthorized
connection.disconnect
connection.error
```

### Message Events

```
message.send
message.sent
message.received
message.delivered
message.read
message.edit
message.edited
message.delete
message.deleted
message.history
message.history.response
```

### Typing Events

```
typing.start
typing.stop
typing.user
```

### Presence Events

```
presence.online
presence.offline
presence.status.update
presence.last.seen
```

### Room Events

```
room.create
room.created
room.join
room.joined
room.leave
room.left
room.delete
room.deleted
room.members.add
room.members.remove
room.members.list
```

### File Events

```
file.upload.start
file.upload.progress
file.upload.complete
file.upload.error
```

---

## 2. Event Payload Structures

### message.send

```typescript
{
  roomId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  replyToId?: string; // For threaded replies
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number; // For audio/video
    dimensions?: { width: number; height: number }; // For images
  };
  tempId: string; // Client-generated ID for optimistic updates
}
```

### message.sent (acknowledgment)

```typescript
{
  tempId: string;
  messageId: string;
  roomId: string;
  timestamp: string;
  status: "sent" | "failed";
}
```

### message.received (broadcast to room)

```typescript
{
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
  };
  metadata?: object;
  timestamp: string;
  editedAt?: string;
}
```

### message.read

```typescript
{
  messageIds: string[];
  roomId: string;
}
```

### typing.start / typing.stop

```typescript
{
  roomId: string;
  userId: string;
  userName: string;
}
```

### presence.status.update

```typescript
{
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}
```

### room.create (for group chat)

```typescript
{
  name: string;
  description?: string;
  memberIds: string[];
  avatar?: string;
  isPrivate: boolean;
}
```

---

## 3. Connection + Disconnection Flow

### Connection Flow

```
1. Client connects to Socket.IO server
   └─> socket.on('connection')

2. Server requests authentication
   └─> emit('connection.authenticate')

3. Client sends JWT token
   └─> emit('connection.authenticate', { token })

4. Server validates token
   ├─> Valid: emit('connection.authenticated', { userId, rooms })
   │   ├─> Join user to their rooms
   │   ├─> Update presence to 'online'
   │   ├─> Broadcast presence.online to contacts
   │   └─> Send pending messages/notifications
   │
   └─> Invalid: emit('connection.unauthorized')
       └─> Disconnect socket
```

### Disconnection Flow

```
1. Client disconnects (network, close tab, etc.)
   └─> socket.on('disconnect')

2. Server detects disconnection
   ├─> Update presence to 'offline'
   ├─> Store lastSeen timestamp
   ├─> Broadcast presence.offline to contacts
   └─> Clean up typing indicators
```

### Reconnection Flow

```
1. Client reconnects with same socket ID (if within timeout)
   ├─> Restore previous session
   ├─> Rejoin rooms
   └─> Sync missed messages

2. Client reconnects with new socket ID
   ├─> Full authentication flow
   └─> Fetch message history since lastSeen
```

---

## 4. Authentication Inside Socket.IO

### Middleware Approach

```typescript
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Verify JWT
    const decoded = await verifyJWT(token);

    // Attach user info to socket
    socket.data.userId = decoded.userId;
    socket.data.userName = decoded.userName;
    socket.data.userAvatar = decoded.userAvatar;

    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});
```

### Token Refresh Strategy

- Store refresh token in httpOnly cookie
- When JWT expires, emit `token.expired` event
- Client requests new token via REST API
- Client reconnects with new token

---

## 5. Room Creation Strategy for 1:1 Chat

### Room ID Generation

```typescript
// Create deterministic room ID from sorted user IDs
function createDirectRoomId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
}
```

### Flow

```
1. User A initiates chat with User B
   └─> Calculate room ID: createDirectRoomId(userA, userB)

2. Check if room exists in database
   ├─> Exists: Join existing room
   └─> Not exists: Create new room
       ├─> Insert into chat_rooms table
       ├─> Add both users as members
       └─> Return room details

3. Join Socket.IO room
   └─> socket.join(roomId)

4. Both users now receive messages in this room
```

### Benefits

- Deterministic: Same room ID always generated for same pair
- No duplicates: Prevents creating multiple rooms for same users
- Efficient: O(1) lookup by room ID

---

## 6. Room Creation Strategy for Group Chat

### Room ID Generation

```typescript
// Generate unique UUID for group rooms
function createGroupRoomId(): string {
  return `group_${uuidv4()}`;
}
```

### Flow

```
1. User creates group chat
   └─> emit('room.create', { name, memberIds, ... })

2. Server validates
   ├─> Check if creator has permission
   ├─> Validate member IDs exist
   └─> Check member count limits

3. Create room in database
   ├─> Insert into chat_rooms (type: 'group')
   ├─> Insert creator as admin in chat_members
   ├─> Insert other members with 'member' role
   └─> Generate unique room ID

4. Join all online members to Socket.IO room
   └─> For each online member: socket.join(roomId)

5. Broadcast room.created to all members
   └─> emit('room.created', { roomId, ... })

6. Send system message
   └─> "User X created the group"
```

### Room Roles

- **admin**: Can add/remove members, change settings, delete room
- **member**: Can send messages, view history
- **left**: User was removed or left (for history purposes)

---

## 7. Database Tables Needed

### chat_rooms

```sql
CREATE TABLE chat_rooms (
  id VARCHAR(255) PRIMARY KEY,
  type ENUM('direct', 'group') NOT NULL,
  name VARCHAR(255), -- NULL for direct chats
  description TEXT,
  avatar_url VARCHAR(500),
  is_private BOOLEAN DEFAULT false,
  created_by VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  INDEX idx_type (type),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);
```

### chat_members

```sql
CREATE TABLE chat_members (
  id VARCHAR(255) PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role ENUM('admin', 'member', 'left') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  last_read_message_id VARCHAR(255),
  last_read_at TIMESTAMP,
  notifications_enabled BOOLEAN DEFAULT true,

  UNIQUE KEY unique_room_user (room_id, user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_room_id (room_id),
  INDEX idx_role (role)
);
```

### chat_messages

```sql
CREATE TABLE chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  type ENUM('text', 'image', 'file', 'audio', 'video', 'system') DEFAULT 'text',
  reply_to_id VARCHAR(255) REFERENCES chat_messages(id),
  metadata JSON, -- For file info, dimensions, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,

  INDEX idx_room_created (room_id, created_at DESC),
  INDEX idx_sender (sender_id),
  INDEX idx_reply_to (reply_to_id),
  FULLTEXT INDEX ft_content (content)
);
```

### chat_message_status

```sql
CREATE TABLE chat_message_status (
  id VARCHAR(255) PRIMARY KEY,
  message_id VARCHAR(255) NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  delivered_at TIMESTAMP NULL,
  read_at TIMESTAMP NULL,

  UNIQUE KEY unique_message_user (message_id, user_id),
  INDEX idx_message_id (message_id),
  INDEX idx_user_status (user_id, status)
);
```

### chat_user_presence

```sql
CREATE TABLE chat_user_presence (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('online', 'offline', 'away', 'busy') DEFAULT 'offline',
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  socket_id VARCHAR(255), -- Current socket ID if online
  device_info JSON, -- Device type, browser, etc.
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_last_seen (last_seen)
);
```

---

## 8. Message Storing Logic + Indexing

### Write Path (Optimized for Speed)

```
1. Client sends message
   └─> Validate content + auth

2. Generate message ID (UUID)
   └─> Store in database (async, non-blocking)

3. Immediately emit to Socket.IO room
   └─> Real-time delivery to online users

4. Cache in Redis (TTL: 24h)
   └─> Fast retrieval for recent messages

5. Create message status records for each room member
   └─> Initial status: 'sent'

6. Return acknowledgment to sender
   └─> { messageId, timestamp, status: 'sent' }
```

### Indexing Strategy

```sql
-- Primary index for message retrieval (cursor pagination)
INDEX idx_room_created (room_id, created_at DESC)

-- For user-specific queries
INDEX idx_sender (sender_id)

-- For threaded replies
INDEX idx_reply_to (reply_to_id)

-- For full-text search
FULLTEXT INDEX ft_content (content)

-- Composite index for unread count
INDEX idx_room_user_read (room_id, user_id, last_read_at)
```

### Partitioning Strategy (for scale)

- Partition `chat_messages` by `created_at` (monthly partitions)
- Archive messages older than 1 year to cold storage
- Keep recent 12 months in hot storage

---

## 9. Real-Time Delivery Strategy

### Online Users (WebSocket)

```
1. Message saved to database
   └─> Get room members from chat_members table

2. Check which members are online (Redis presence)
   └─> Get socket IDs from Redis

3. Emit to Socket.IO room
   └─> io.to(roomId).emit('message.received', payload)

4. Track delivery status
   └─> When client ACKs, update chat_message_status to 'delivered'
```

### Offline Users (Push Notifications)

```
1. Identify offline members
   └─> Query chat_user_presence WHERE status = 'offline'

2. Queue push notification job
   └─> Add to Redis queue or database

3. Send via FCM/APNs
   ├─> Mobile: FCM (Android) / APNs (iOS)
   └─> Web: Web Push API

4. Store in pending messages table
   └─> Will be synced when user comes online
```

### Hybrid (Partial Delivery)

- User online on mobile but not web: Send to mobile socket only
- User has multiple devices: Send to all connected sockets
- Use Redis Pub/Sub for horizontal scaling across servers

---

## 10. Chat Caching Using Redis

### Cache Structure

#### Recent Messages Cache

```redis
# Key: room:{roomId}:messages
# Type: Sorted Set (score = timestamp)
# TTL: 24 hours

ZADD room:abc123:messages 1700000000 '{"id":"msg1","content":"Hello",...}'
ZADD room:abc123:messages 1700000060 '{"id":"msg2","content":"Hi",...}'

# Retrieve last 50 messages
ZREVRANGE room:abc123:messages 0 49
```

#### User Presence Cache

```redis
# Key: presence:{userId}
# Type: Hash
# TTL: No expiry (updated on activity)

HSET presence:user123 status "online"
HSET presence:user123 lastSeen "2025-11-19T10:30:00Z"
HSET presence:user123 socketId "socket_abc"
```

#### Typing Indicators Cache

```redis
# Key: typing:{roomId}
# Type: Set (members who are typing)
# TTL: 5 seconds (auto-expires)

SADD typing:room123 "user456"
EXPIRE typing:room123 5

# Get who's typing
SMEMBERS typing:room123
```

#### Unread Count Cache

```redis
# Key: unread:{userId}
# Type: Hash (roomId -> count)

HINCRBY unread:user123 room456 1
HGET unread:user123 room456
HSET unread:user123 room456 0  # Mark as read
```

#### Rate Limit Cache

```redis
# Key: ratelimit:message:{userId}
# Type: String (counter)
# TTL: 60 seconds

INCR ratelimit:message:user123
EXPIRE ratelimit:message:user123 60
```

### Cache Invalidation Strategy

- **Write-through**: Update cache when writing to DB
- **TTL-based**: Recent messages expire after 24h
- **Event-based**: Clear on message edit/delete
- **Cache warming**: Preload popular rooms on startup

---

## 11. Handling Large Message History with Cursor Pagination

### Cursor-Based Pagination (Recommended)

```typescript
interface MessageHistoryRequest {
  roomId: string;
  cursor?: string; // Timestamp or message ID
  limit: number; // Default: 50, Max: 100
  direction: "before" | "after"; // Load older or newer messages
}

interface MessageHistoryResponse {
  messages: Message[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
}
```

### SQL Query (Optimized)

```sql
-- Load messages BEFORE cursor (older messages)
SELECT * FROM chat_messages
WHERE room_id = ?
  AND created_at < ?  -- cursor timestamp
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 51;  -- Fetch one extra to check hasMore

-- Load messages AFTER cursor (newer messages)
SELECT * FROM chat_messages
WHERE room_id = ?
  AND created_at > ?
  AND deleted_at IS NULL
ORDER BY created_at ASC
LIMIT 51;
```

### Redis Cache Strategy

```typescript
// Check cache first
const cached = await redis.zrevrangebyscore(
  `room:${roomId}:messages`,
  cursor,
  '-inf',
  'LIMIT', 0, limit
);

if (cached.length >= limit) {
  return cached; // Cache hit
}

// Cache miss: Fetch from database
const messages = await db.query(...);

// Update cache (pipeline for atomicity)
const pipeline = redis.pipeline();
messages.forEach(msg => {
  pipeline.zadd(`room:${roomId}:messages`, msg.timestamp, JSON.stringify(msg));
});
await pipeline.exec();
```

### Infinite Scroll Implementation

```typescript
// Frontend: Load initial messages
const [messages, setMessages] = useState([]);
const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);

const loadMoreMessages = async () => {
  const response = await socket.emitWithAck("message.history", {
    roomId,
    cursor,
    limit: 50,
    direction: "before",
  });

  setMessages((prev) => [...prev, ...response.messages]);
  setCursor(response.nextCursor);
  setHasMore(response.hasMore);
};

// Trigger on scroll to top
useEffect(() => {
  if (scrollTop === 0 && hasMore) {
    loadMoreMessages();
  }
}, [scrollTop]);
```

---

## 12. Rate Limiting for Chat Messages

### Strategy: Token Bucket Algorithm

#### Redis Implementation

```typescript
async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `ratelimit:message:${userId}`;
  const limit = 10; // 10 messages
  const window = 60; // per 60 seconds

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  if (current > limit) {
    const ttl = await redis.ttl(key);
    throw new RateLimitError(`Rate limit exceeded. Try again in ${ttl}s`);
  }

  return true;
}
```

### Multi-Tier Rate Limits

```typescript
const RATE_LIMITS = {
  message: {
    limit: 10,
    window: 60, // 10 messages per minute
  },
  file: {
    limit: 5,
    window: 300, // 5 files per 5 minutes
  },
  room_create: {
    limit: 3,
    window: 3600, // 3 rooms per hour
  },
  typing: {
    limit: 30,
    window: 60, // 30 typing events per minute
  },
};
```

### Burst Protection

```typescript
// Sliding window log for accurate rate limiting
async function slidingWindowRateLimit(userId: string): Promise<boolean> {
  const key = `ratelimit:sliding:${userId}`;
  const now = Date.now();
  const window = 60000; // 60 seconds
  const limit = 10;

  // Remove old entries
  await redis.zremrangebyscore(key, 0, now - window);

  // Count recent requests
  const count = await redis.zcard(key);

  if (count >= limit) {
    throw new RateLimitError("Rate limit exceeded");
  }

  // Add new request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(window / 1000));

  return true;
}
```

### Error Response

```typescript
{
  error: 'RATE_LIMIT_EXCEEDED',
  message: 'Too many messages. Please slow down.',
  retryAfter: 45, // seconds
  limit: 10,
  window: 60
}
```

---

## Architecture Diagram

```
┌─────────────┐
│   Clients   │ (Web, iOS, Android)
└──────┬──────┘
       │ WebSocket (Socket.IO)
       │
┌──────▼──────────────────────────────┐
│     Load Balancer (Nginx)           │
│     (WebSocket-aware)                │
└──────┬──────────────────────────────┘
       │
       ├──────┬──────┬──────┐
       │      │      │      │
   ┌───▼──┐ ┌─▼───┐ ┌─▼───┐ ┌─▼───┐
   │ WS 1 │ │ WS 2│ │ WS 3│ │ WS N│  (Socket.IO Servers)
   └───┬──┘ └─┬───┘ └─┬───┘ └─┬───┘
       │      │      │      │
       └──────┴──────┴──────┴────────┐
                                      │
              ┌───────────────────────▼────┐
              │   Redis Pub/Sub            │
              │   - Presence               │
              │   - Typing indicators      │
              │   - Message cache          │
              │   - Rate limiting          │
              └───────────────────────┬────┘
                                      │
              ┌───────────────────────▼────┐
              │   PostgreSQL               │
              │   - chat_rooms             │
              │   - chat_messages          │
              │   - chat_members           │
              │   - chat_message_status    │
              └────────────────────────────┘
                                      │
              ┌───────────────────────▼────┐
              │   S3 / CDN                 │
              │   - File uploads           │
              │   - Images, videos         │
              └────────────────────────────┘
```

---

## Performance Considerations

### Scalability

- **Horizontal scaling**: Multiple Socket.IO servers behind load balancer
- **Redis Adapter**: Sync events across servers using Redis Pub/Sub
- **Database replication**: Read replicas for message history
- **CDN**: Serve media files from edge locations

### Optimization

- **Batching**: Group multiple read receipts into one database update
- **Debouncing**: Typing indicators sent max once per 2 seconds
- **Lazy loading**: Load message history on demand
- **Compression**: Use WebSocket compression for large payloads

### Monitoring

- Track metrics: Messages/sec, connections, latency, error rate
- Alert on: High CPU, memory usage, connection drops
- Log: All errors, slow queries, rate limit violations

---

This architecture provides a solid foundation for a production-ready chat system with real-time features, scalability, and reliability.

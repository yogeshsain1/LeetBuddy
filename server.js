const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const socketPort = parseInt(process.env.SOCKET_PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Next.js HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Next.js ready on http://${hostname}:${port}`);
  });

  // Socket.io server (separate port)
  const socketServer = createServer();
  
  // Initialize Socket.io directly here
  const { Server } = require('socket.io');
  const io = new Server(socketServer, {
    cors: {
      origin: `http://${hostname}:${port}`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });

    // Placeholder for Socket.io events
    // Note: Full implementation requires TypeScript compilation
    socket.on('authenticate', (data) => {
      console.log('Authentication attempt:', data);
      socket.emit('authenticated', { success: true });
    });

    socket.on('send_message', (data) => {
      console.log('Message received:', data);
      io.to(data.roomId?.toString()).emit('new_message', {
        id: Date.now(),
        content: data.content,
        senderId: data.userId,
        roomId: data.roomId,
        createdAt: new Date().toISOString(),
        sender: {
          id: data.userId,
          name: 'User',
          avatarUrl: null,
        },
      });
    });

    socket.on('join_room', (roomId) => {
      socket.join(roomId.toString());
      console.log('Joined room:', roomId);
    });

    socket.on('typing_start', (data) => {
      socket.to(data.roomId.toString()).emit('user_typing', {
        roomId: data.roomId,
        userId: data.userId,
        username: 'User',
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.roomId.toString()).emit('user_stopped_typing', {
        roomId: data.roomId,
        userId: data.userId,
      });
    });
  });
  
  socketServer.listen(socketPort, (err) => {
    if (err) throw err;
    console.log(`> Socket.io ready on http://${hostname}:${socketPort}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing servers');
    httpServer.close(() => {
      console.log('HTTP server closed');
    });
    socketServer.close(() => {
      console.log('Socket.io server closed');
    });
  });
});

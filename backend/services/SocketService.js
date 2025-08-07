// backend/services/SocketService.js
const socketIO = require('socket.io');

class SocketService {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
      }
    });

    this.setupEvents();
  }

  setupEvents() {
    this.io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);

      // Join user to their personal room
      socket.on('authenticate', (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.join(`user_${decoded.userId}`);
          console.log(`User ${decoded.userId} connected to socket`);
        } catch (error) {
          console.error('Socket authentication failed:', error);
          socket.disconnect();
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  notifyUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  notifyBotStatus(userId, botId, status, message) {
    this.notifyUser(userId, 'bot-status', {
      botId,
      status,
      message,
      timestamp: new Date()
    });
  }
}
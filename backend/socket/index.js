const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Message, Chat } = require('../models/Chat');

const setupSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join user's personal room
    socket.join(`user:${socket.user._id}`);

    // Join a chat room
    socket.on('join:chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`${socket.user.name} joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave:chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // Send message via socket
    socket.on('send:message', async ({ chatId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const chat = await Chat.findById(chatId);
        if (!chat) return;

        if (!chat.participants.map((p) => p.toString()).includes(socket.user._id.toString())) {
          return;
        }

        const message = await Message.create({
          chat: chatId,
          sender: socket.user._id,
          text: text.trim(),
        });

        await message.populate('sender', 'name avatar');

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: text.trim().substring(0, 100),
          lastMessageAt: new Date(),
        });

        // Emit to all users in the chat room
        io.to(`chat:${chatId}`).emit('new:message', message);

        // Notify other participants
        chat.participants.forEach((participantId) => {
          if (participantId.toString() !== socket.user._id.toString()) {
            io.to(`user:${participantId}`).emit('chat:updated', {
              chatId,
              lastMessage: text.trim(),
              lastMessageAt: new Date(),
            });
          }
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', {
        userId: socket.user._id,
        userName: socket.user.name,
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', {
        userId: socket.user._id,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = setupSocket;

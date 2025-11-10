const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const connectedUsers = new Map();

const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    try {
      // Update user status and store socket mapping
      await User.findByIdAndUpdate(socket.userId, { isOnline: true });
      connectedUsers.set(socket.userId, socket.id);

      // Join personal room for private messages
      socket.join(socket.userId);

      // Broadcast online status
      socket.broadcast.emit('user:online', { userId: socket.userId });

      // Handle private messages
      socket.on('message:private', async (data) => {
        try {
          const message = new Message({
            sender: socket.userId,
            recipient: data.recipientId,
            content: data.content,
            isEncrypted: true
          });

          await message.save();
          
          const recipientSocket = connectedUsers.get(data.recipientId);
          if (recipientSocket) {
            io.to(recipientSocket).emit('message:received', {
              ...message.toJSON(),
              content: message.decryptMessage()
            });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle group messages
      socket.on('message:group', async (data) => {
        try {
          const message = new Message({
            sender: socket.userId,
            group: data.groupId,
            content: data.content,
            isEncrypted: true
          });

          await message.save();
          
          io.to(data.groupId).emit('message:received', {
            ...message.toJSON(),
            content: message.decryptMessage()
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing status
      socket.on('typing:start', (data) => {
        const recipientSocket = connectedUsers.get(data.recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('typing:started', { userId: socket.userId });
        }
      });

      socket.on('typing:stop', (data) => {
        const recipientSocket = connectedUsers.get(data.recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('typing:stopped', { userId: socket.userId });
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        try {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
          });
          connectedUsers.delete(socket.userId);
          socket.broadcast.emit('user:offline', {
            userId: socket.userId,
            lastSeen: new Date()
          });
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      });
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  });
};

module.exports = { setupSocketHandlers };
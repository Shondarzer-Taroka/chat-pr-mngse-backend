// // // src/services/socketServices.js
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

let io;

const init = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user personal room
    socket.on('join', async (userId) => {
      socket.join(userId);
      await User.findByIdAndUpdate(userId, { online: true });
      io.emit('user-online', userId);
    });

    // Join a chat room (all participants should join this)
    socket.on('join-chat', async (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat room ${chatId}`);
    });

    // Handle new message
    socket.on('send-message', async (messageData) => {
      try {
        const newMessage = await Message.create(messageData);

        // Populate sender & chat participants
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'username email')
          .populate({
            path: 'chat',
            populate: { path: 'participants', select: 'username email' }
          });

        // Update chat lastMessage
        await Chat.findByIdAndUpdate(messageData.chat, { lastMessage: newMessage._id });

        // Emit to chat room
        io.to(messageData.chat).emit('receive-message', populatedMessage);

      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = { init };











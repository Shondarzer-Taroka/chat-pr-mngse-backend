const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

let io;

const init = (socketIO) => {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join user to their room
    socket.on('join', async (userId) => {
      socket.join(userId);
      await User.findByIdAndUpdate(userId, { online: true });
      io.emit('user-online', userId);
    });
    
    // Handle new message
    socket.on('send-message', async (messageData) => {
      try {
        const newMessage = new Message(messageData);
        await newMessage.save();
        
        // Update chat last message
        await Chat.findByIdAndUpdate(messageData.chat, {
          lastMessage: newMessage._id
        });
        
        // Emit to all participants
        const chat = await Chat.findById(messageData.chat);
        chat.participants.forEach(participant => {
          io.to(participant.toString()).emit('receive-message', newMessage);
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      // Find user by socket ID and set offline
      // This would require mapping socket IDs to user IDs in a production app
    });
  });
};

module.exports = { init };
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

const getChats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username email online')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    next(error);
  }
};

const getOrCreateChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { participantId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId], $size: 2 }
    }).populate('participants', 'username email online');

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [userId, participantId]
      });
      await chat.save();
      
      // Populate participants after save
      chat = await Chat.findById(chat._id).populate('participants', 'username email online');
    }

    // Get messages for this chat
    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .populate('sender', 'username');

    res.json({ chat, messages });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username');

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = { getChats, getOrCreateChat, getMessages };
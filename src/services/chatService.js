const Chat = require('../models/Chat');
const Message = require('../models/Message');

const createChat = async (participants) => {
  const chat = new Chat({ participants });
  await chat.save();
  return chat;
};

const getChatById = async (chatId) => {
  return await Chat.findById(chatId)
    .populate('participants', 'username email online')
    .populate('lastMessage');
};

const addMessage = async (sender, chatId, content) => {
  const message = new Message({ sender, chat: chatId, content });
  await message.save();

  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

  return message;
};

module.exports = { createChat, getChatById, addMessage };
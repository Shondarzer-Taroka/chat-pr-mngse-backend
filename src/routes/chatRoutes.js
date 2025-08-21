const express = require('express');
const router = express.Router();
const { getChats, getOrCreateChat, getMessages } = require('../controllers/chatController');

router.get('/', getChats);
router.post('/', getOrCreateChat);
router.get('/:chatId/messages', getMessages);

module.exports = router;
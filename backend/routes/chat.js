const express = require('express');
const router = express.Router();
const { getOrCreateChat, getMyChats, getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, getOrCreateChat);
router.get('/', protect, getMyChats);
router.get('/:chatId/messages', protect, getMessages);
router.post('/:chatId/messages', protect, sendMessage);

module.exports = router;

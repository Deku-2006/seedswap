const { Chat, Message } = require('../models/Chat');
const User = require('../models/User');

exports.getOrCreateChat = async (req, res) => {
  try {
    const { recipientId, listingId } = req.body;
    const userId = req.user._id;

    if (userId.toString() === recipientId) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let chat = await Chat.findOne({
      participants: { $all: [userId, recipientId] },
    }).populate('participants', 'name avatar location');

    if (!chat) {
      chat = await Chat.create({
        participants: [userId, recipientId],
        listing: listingId || null,
      });
      chat = await chat.populate('participants', 'name avatar location');
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar location')
      .populate('listing', 'title image')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    if (!chat.participants.map((p) => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this chat.' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    if (!chat.participants.map((p) => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      text: text.trim(),
    });

    await message.populate('sender', 'name avatar');

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text.trim().substring(0, 100),
      lastMessageAt: new Date(),
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

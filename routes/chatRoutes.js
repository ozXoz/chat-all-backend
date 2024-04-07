// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/authMiddleware');

// Bir odadaki tüm mesajları getir
router.get('/messages/:room', authenticateToken, async (req, res) => {
  try {
    // Kullanıcı bilgilerini de içerecek şekilde mesajları getir
    const messages = await Message.find({ room: req.params.room }).populate('user', 'username');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bir odaya yeni mesaj gönder
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { room, user, message } = req.body;
    const newMessage = new Message({ room, user, message });
    await newMessage.save();

    // Populate 'user' field to include user details in the response
    const savedMessage = await newMessage.populate('user', 'username email'); // Adjust fields as needed

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;

// routes/roomRoutes.js
const express = require("express");
const Room = require("../models/Room");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Oda oluşturma
router.post("/rooms", authenticateToken, isAdmin, async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Oda listesi
router.get("/rooms", authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Oda silme
router.delete("/rooms/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Oda listesi
// Oda listesi için doğru endpoint
router.get("/", authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const chatRoutes = require("./routes/chatRoutes"); // Mesajlaşma için API rotaları
const roomRoutes = require("./routes/roomRoutes"); // Oda yönetimi için API rotaları
const authRoutes = require("./routes/auth"); // Kullanıcı kimlik doğrulama için API rotaları
const userRoutes = require("./routes/userRoutes"); // Kullanıcı yönetimi için API rotaları
const Message = require("./models/Message"); // Mesaj modelini import edin
const User = require('./models/User'); // User modelini import et

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Could not connect to MongoDB", err));

app.get("/", (req, res) => {
  res.send("Hello,High level chat application!");
});

app.use("/auth", authRoutes);
app.use("/admin", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ room }) => {
    socket.join(room);
    console.log(`A user joined room: ${room}`);
    socket.broadcast.to(room).emit("message", "A new user has joined the room");
  });

  // This is the event handler where the debugging code should go
  socket.on("chatMessage", async ({ room, userId, message }) => {
  try {
    const newMessage = new Message({
      room,
      user: userId, // Directly use userId here
      message,
    });

    await newMessage.save();
    // Populate user details before emitting the message
    const populatedMessage = await newMessage.populate('user', 'username');

    console.log("Message saved to database");
    io.to(room).emit("message", populatedMessage); // Emit populated message
  } catch (error) {
    console.error("Error saving message to database:", error);
  }
});

 // Handle WebRTC signaling data
 socket.on("webrtc_signal", (data) => {
  const { room, ...signalData } = data;
  socket.to(room).emit("webrtc_signal", signalData);
});

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

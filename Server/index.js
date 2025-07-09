import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import videoroutes from './Routes/video.js';
import userroutes from "./Routes/User.js";
import commentroutes from './Routes/comment.js';
import groupRoutes from './Routes/group.js';

dotenv.config();
const app = express();
console.log("🟢 Server starting...");

// ✅ Define allowed origins for CORS
const allowedOrigins = [
  "https://youtubeclone-yourtube.netlify.app",
  "http://localhost:3000" // optional: for local testing
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use('/uploads', express.static(path.join('uploads')));

// ✅ Route handlers
app.get('/', (req, res) => {
  res.send("Backend is working");
});

app.use('/user', userroutes);
app.use('/video', videoroutes);
app.use('/comment', commentroutes);
app.use('/group', groupRoutes);

const server = http.createServer(app);

// Set up Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins, // Use the same allowedOrigins array as Express
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Multi-user join logic
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    // Get all users in the room except the new user
    const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []).filter(id => id !== socket.id);
    // Send the list to the new user
    socket.emit('all-users', usersInRoom);
    // Notify existing users about the new user
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Relay offer
  socket.on('offer', (data) => {
    // data: { roomId, to, offer }
    socket.to(data.to).emit('offer', { from: socket.id, offer: data.offer });
  });

  // Relay answer
  socket.on('answer', (data) => {
    // data: { roomId, to, answer }
    socket.to(data.to).emit('answer', { from: socket.id, answer: data.answer });
  });

  // Relay ICE candidates
  socket.on('ice-candidate', (data) => {
    // data: { roomId, to, candidate }
    socket.to(data.to).emit('ice-candidate', { from: socket.id, candidate: data.candidate });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Notify all rooms this user was in
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('user-left', socket.id);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL).then(() => {
  console.log("🟢 MongoDB connected");
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("❌ MongoDB connection error:", error);
});

// ✅ Test endpoint
app.get('/test', (req, res) => {
  res.status(200).send('Server is responding');
});

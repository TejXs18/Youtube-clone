import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { Server } from "socket.io";

import videoroutes from './Routes/video.js';
import userroutes from "./Routes/User.js";
import commentroutes from './Routes/comment.js';
import groupRoutes from './Routes/group.js';
import streamRoutes from './Routes/stream.js';

dotenv.config();
const app = express();
console.log("🟢 Server starting...");

// ✅ Define allowed origins for CORS
// TEMP: Allow all origins for debugging
app.use(cors({
  origin: "*",
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
app.use('/stream', streamRoutes);

const roomUsers = new Map();

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL).then(() => {
  console.log("🟢 MongoDB connected");
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🟢 [Socket] User connected: ${socket.id}`);

    socket.on("join-room", (roomId) => {
      console.log(`🟢 [Socket] User ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);

      // Track users in room
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(socket.id);

      // Get all users in the room except the new user
      const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []).filter(id => id !== socket.id);

      console.log(`🟢 [Socket] Room ${roomId} users:`, usersInRoom);
      console.log(`🟢 [Socket] Total users in room ${roomId}:`, roomUsers.get(roomId).size);

      // Send the list to the new user
      socket.emit('all-users', usersInRoom);
      console.log(`🟢 [Socket] Sent all-users to ${socket.id}:`, usersInRoom);
    });

    // Optionally: handle disconnects, etc.
  });

}).catch((error) => {
  console.error("❌ MongoDB connection error:", error);
});

// ✅ Test endpoint
app.get('/test', (req, res) => {
  res.status(200).send('Server is responding');
});

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

const server = http.createServer(app);


// Set up Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // TEMP: Allow all origins for debugging
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Track rooms and users for debugging
const roomUsers = new Map(); // roomId -> Set of socketIds

io.on('connection', (socket) => {
  console.log('🟢 [Socket] User connected:', socket.id);

  // Multi-user join logic
  socket.on('join-room', (roomId) => {
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
    
    // Notify existing users about the new user
    socket.to(roomId).emit('user-joined', socket.id);
    console.log(`🟢 [Socket] Notified room ${roomId} about new user: ${socket.id}`);
  });

  // Relay offer
  socket.on('offer', (data) => {
    console.log(`🟢 [Signaling] Offer from ${socket.id} to ${data.to}`);
    console.log(`🟢 [Signaling] Offer data:`, JSON.stringify(data.offer, null, 2));
    socket.to(data.to).emit('offer', { from: socket.id, offer: data.offer });
  });

  // Relay answer
  socket.on('answer', (data) => {
    console.log(`🟢 [Signaling] Answer from ${socket.id} to ${data.to}`);
    console.log(`🟢 [Signaling] Answer data:`, JSON.stringify(data.answer, null, 2));
    socket.to(data.to).emit('answer', { from: socket.id, answer: data.answer });
  });

  // Relay ICE candidates
  socket.on('ice-candidate', (data) => {
    console.log(`🟢 [Signaling] ICE candidate from ${socket.id} to ${data.to}`);
    socket.to(data.to).emit('ice-candidate', { from: socket.id, candidate: data.candidate });
  });

  socket.on('disconnect', () => {
    console.log('🔴 [Socket] User disconnected:', socket.id);
    
    // Remove from all rooms
    for (const [roomId, users] of roomUsers.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        console.log(`🔴 [Socket] Removed ${socket.id} from room ${roomId}`);
        
        // Notify other users in the room
        socket.to(roomId).emit('user-left', socket.id);
        console.log(`🔴 [Socket] Notified room ${roomId} that ${socket.id} left`);
        
        // Clean up empty rooms
        if (users.size === 0) {
          roomUsers.delete(roomId);
          console.log(`🔴 [Socket] Removed empty room: ${roomId}`);
        }
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

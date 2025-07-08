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
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room for 1:1 or group call
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Relay offer
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  // Relay answer
  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  // Relay ICE candidates
  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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

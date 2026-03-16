import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap = {};

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //todo
  const groups = await Group.find({ members: userId });
  groups.forEach((group) => {
    socket.join(group._id.toString());
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    await User.findByIdAndUpdate(
      userId,
      { lastActive: new Date() },
      { new: true },
    );
  });
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, server, app };

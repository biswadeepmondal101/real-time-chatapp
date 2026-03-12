import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { get } from "http";

export const getAllUsers = async (req, res) => {
  try {
    const myId = req.user._id;
    const userContacts = req.user.contact;
    const users = await User.find({ _id: { $in: userContacts } }).select(
      "-password",
    );
    const conversations = await Conversation.find({
      participants: myId,
    });
    if (!conversations)
      return res.status(500).json({ message: "No conversations" });
    const sidebarUsers = users.map((user) => {
      const conversation = conversations.find((conv) =>
        conv.participants.includes(user._id),
      );
      return {
        ...user._doc,
        lastMessage: conversation?.lastMessage?.text || "",
        lastMessageTime: conversation?.lastMessage?.createdAt,
      };
    });
    return res.status(200).json(sidebarUsers);
  } catch (error) {
    console.log("Error in getAllUsers", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponce = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponce.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    await Conversation.findOneAndUpdate(
      {
        participants: { $all: [senderId, receiverId] },
      },
      {
        $set: {
          "lastMessage.text": text || (image ? "📷 Image" : ""),
          "lastMessage.senderId": senderId,
          "lastMessage.createdAt": new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
    return res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

io.on("connection", (socket) => {
  socket.on("messageSeen", async (senderId, receiverId) => {
    await Message.updateMany(
      {
        senderId: senderId,
        receiverId,
        seen: false,
      },
      {
        seen: true,
      },
    );

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeenUpdate", receiverId);
    }
  });
});

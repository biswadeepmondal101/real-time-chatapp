import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllUsers = async (req, res) => {
  try {
    const myId = req.user._id;
    const userContacts = req.user.contact;
    const userGroups = req.user.groups;

    const users = await User.find({ _id: { $in: userContacts } }).select(
      "-password",
    );
    const conversations = await Conversation.find({ participants: myId });

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
        unreadCount: conversation?.unreadCount?.get(myId.toString()) || 0,
        isGroup: false,
      };
    });

    const groups = await Group.find({ _id: { $in: userGroups } });

    const sidebarGroups = groups.map((group) => ({
      ...group._doc,
      lastMessage: group.lastMessage?.text || "",
      lastMessageTime: group.lastMessage?.createdAt,
      unreadCount: group.unreadCount?.get(myId.toString()) || 0,
      isGroup: true,
    }));

    const combined = [...sidebarUsers, ...sidebarGroups];

    combined.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
    );

    return res.status(200).json(combined);
  } catch (error) {
    console.log("Error in getAllUsers", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const myId = req.user._id;

    const group = await Group.findById(userId);

    if (group) {
      const messages = await Message.find({ receiverId: userId }).populate(
        "senderId",
        "fullName profilePic",
      );

      const updates = {};
      group.members.forEach((member) => {
        if (member.toString() === myId.toString()) {
          updates[`unreadCount.${member}`] = 0;
        }
      });

      await Group.findByIdAndUpdate(userId, {
        $set: updates,
      });

      return res.status(200).json(messages);
    } else {
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId },
        ],
      }).populate("senderId", "fullName profilePic");

      await Conversation.findOneAndUpdate(
        {
          participants: { $all: [myId, userId] },
        },
        {
          $set: {
            [`unreadCount.${myId}`]: 0,
          },
        },
      );

      return res.status(200).json(messages);
    }
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
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "fullName profilePic",
    );

    const group = await Group.findById(receiverId);

    if (group) {
      //handeling group chating
      if (group._id) {
        io.to(group._id.toString()).emit("newMessage", populatedMessage);
      }

      const updates = {};
      group.members.forEach((member) => {
        if (member.toString() !== senderId.toString()) {
          updates[`unreadCount.${member}`] = 1;
        }
      });

      await Group.findByIdAndUpdate(receiverId, {
        $set: {
          "lastMessage.text": text || (image ? "📷 Image" : ""),
          "lastMessage.senderId": senderId,
          "lastMessage.createdAt": new Date(),
        },
        $inc: updates,
      });
    } else {
      //handeling private chating
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage);
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
          $inc: {
            [`unreadCount.${receiverId}`]: 1,
          },
        },
        {
          new: true,
          upsert: true,
        },
      );
    }
    return res.status(200).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  socket.userId = userId;

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

    const group = await Group.findById(receiverId);

    if (group) {
      // GROUP CHAT
      await Group.findByIdAndUpdate(receiverId, {
        $set: {
          [`unreadCount.${socket.userId}`]: 0,
        },
      });
    } else {
      // PRIVATE CHAT
      await Conversation.findOneAndUpdate(
        {
          participants: { $all: [senderId, receiverId] },
        },
        {
          $set: {
            [`unreadCount.${socket.userId}`]: 0,
          },
        },
      );
    }
  });

  socket.on("typingStart", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTypingStart", { senderId });
    }
  });

  socket.on("typingStop", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTypingStop", { senderId });
    }
  });
});

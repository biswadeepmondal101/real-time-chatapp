import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      text: {
        type: String,
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
      },
    },

    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },

    lastReadAt: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Conversation", conversationSchema);

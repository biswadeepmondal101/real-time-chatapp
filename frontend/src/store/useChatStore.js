import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/all-users");
      if (res.data.length === 0) return toast.error("No users found");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.messages);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    const { selectedUser, users } = get();
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      const updatedUsers = users.map((user) => {
        if (user._id === selectedUser._id) {
          return {
            ...user,
            unreadCount: 0,
          };
        }
        return user;
      });

      set({ users: updatedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessages: async (messageData) => {
    const { selectedUser, messages, users } = get();
    try {
      const res = await axiosInstance.post(
        `messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });

      const updatedUsers = users.map((user) => {
        if (user._id === selectedUser._id) {
          return {
            ...user,
            lastMessage:
              messageData.text || (messageData.image ? "📷 Image" : ""),
            lastMessageTime: res.data.createdAt,
          };
        }
        return user;
      });

      set({
        users: updatedUsers.sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
        ),
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      const authUser = useAuthStore.getState().authUser;
      const { messages, users, selectedUser } = get();

      const otherUserId =
        newMessage.senderId === authUser._id
          ? newMessage.receiverId
          : newMessage.senderId;

      const updatedUsers = users.map((user) => {
        if (user._id !== otherUserId) return user;

        const isChatOpen = selectedUser?._id === otherUserId;

        return {
          ...user,
          lastMessage: newMessage.text || (newMessage.image ? "📷 Image" : ""),
          lastMessageTime: newMessage.createdAt,
          unreadCount: isChatOpen ? 0 : user.unreadCount + 1,
        };
      });

      set({
        users: updatedUsers.sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
        ),
      });

      if (!selectedUser) return;

      const isNewMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isNewMessageFromSelectedUser) return;

      set({ messages: [...messages, newMessage] });

      if (!newMessage.seen) {
        socket.emit("messageSeen", selectedUser._id, newMessage.receiverId);
      }
    });

    socket.on("messageSeenUpdate", (receiverId) => {
      const newMessages = get().messages.map((message) => {
        if (message.receiverId === receiverId) {
          return { ...message, seen: true };
        }
        return message;
      });
      set({ messages: newMessages });
    });
  },

  unsubscribeToMessages: async () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageSeenUpdate");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

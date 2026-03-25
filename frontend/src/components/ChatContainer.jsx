import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../utils/FormatMessageTime.js";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

export const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeToMessages,
    users,
  } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    subscribeToMessages();
    getMessages(selectedUser._id);
    socket.emit("messageSeen", selectedUser._id, authUser._id);
    return () => unsubscribeToMessages();
  }, [selectedUser._id, getMessages]);

  const prevMessagesLength = useRef(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!messagesEndRef.current) return;

    if (isInitialLoad.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      isInitialLoad.current = false;
    } else if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLength.current = messages.length;
  }, [messages]);

  useEffect(() => {
    isInitialLoad.current = true;
    prevMessagesLength.current = 0;
  }, [selectedUser]);

  const downloadImage = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "image.jpg";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 flex flex-col overflow-auto">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId._id === authUser._id ? "chat-end " : "chat-start"}`}
            ref={messagesEndRef}
          >
            <div className="chat-header mb-1">
              <div className="font-medium">
                {message.senderId._id === authUser._id
                  ? "You"
                  : message.senderId.fullName}
              </div>
              <time className="text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
              {!selectedUser.isGroup &&
                message.senderId._id === authUser._id && (
                  <div>{message.seen ? "seen" : "delivered"}</div>
                )}
            </div>

            <div
              className={`chat-bubble flex flex-col ${
                message.senderId._id === authUser._id && "chat-bubble-primary"
              }`}
            >
              {message.image && (
                <div className="relative group w-fit">
                  <img
                    src={message.image}
                    alt="Sent message"
                    className="sm:max-w[200px] rounded-md mb-2"
                  />
                  <button
                    onClick={() => downloadImage(message.image)}
                    className="absolute top-0 right-0 hidden group-hover:block text-xs bg-zinc-700 px-2 py-1 rounded"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="relative group w-fit">
                <p>{message.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;

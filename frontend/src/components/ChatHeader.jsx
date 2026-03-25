import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatLastSeen } from "../utils/FormatMessageTime.js";
import { Link } from "react-router-dom";

const ChatHeader = () => {
  const { selectedUser } = useChatStore();
  const { onlineUsers, socket } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    socket.on("userTypingStart", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(true);
      }
    });

    socket.on("userTypingStop", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("userTypingStart");
      socket.off("userTypingStop");
    };
  }, [selectedUser._id]);

  return (
    <div className="p-2.5 border-b border-base-300/20 bg-base-100/0 sticky top-0 z-10 backdrop-blur-md">
      <Link
        to={selectedUser.isGroup ? "/groupinfo" : "/profile"}
        state={{ isCurrentUser: false, user: selectedUser }}
      >
        <div className="flex items-center justify-between">
          <div className="px-4 flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName || selectedUser.name}
                  className="object-cover rounded-full"
                />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">
                {selectedUser.fullName || selectedUser.name}
              </h3>
              <p className="text-sm text-base-content/70">
                {selectedUser.isGroup
                  ? "Tap to view group info"
                  : isTyping
                    ? "Typing..."
                    : onlineUsers.includes(selectedUser._id)
                      ? "Online"
                      : formatLastSeen(selectedUser.lastActive)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
export default ChatHeader;

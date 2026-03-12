import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatLastSeen } from "../utils/FormatMessageTime.js";
import { Link } from "react-router-dom";

const ChatHeader = () => {
  const { selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <Link
        to={"/profile"}
        state={{ isCurrentUser: false, user: selectedUser }}
      >
        <div className="flex items-center justify-between">
          <div className="px-4 flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className=" size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id)
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

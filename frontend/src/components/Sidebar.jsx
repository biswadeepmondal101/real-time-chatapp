import React, { useEffect, useState } from "react";
import { PlusCircle, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../utils/FormatMessageTime.js";

export const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUserLoading,
    subscribeToMessages,
    unsubscribeToMessages,
  } = useChatStore();

  const { onlineUsers, addContact } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleAddcontact = async () => {
    if (!input.trim()) return;
    await addContact({ email: input });
    getUsers();
  };

  useEffect(() => {
    getUsers();
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUserLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-50 lg:w-90 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2 space-x-30 overflow-auto justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>

          <button
            title="Add contact"
            onClick={() => setOpen(true)}
            className=" text-zinc-400 cursor-pointer hover:text-white transition-colors"
          >
            <PlusCircle className="size-6" />
          </button>
          {open && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Enter Email ID to Add</h3>

                <input
                  type="text"
                  placeholder="Email"
                  className="input input-bordered w-full mt-4"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />

                <div className="modal-action">
                  <button className="btn" onClick={() => setOpen(false)}>
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      handleAddcontact();
                      setOpen(false);
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={` w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
              ${user._id === selectedUser?._id ? "bg-base-300" : ""}`}
          >
            <div className="relative">
              <img
                src={user.profilePic || "./avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0 w-full">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div className="font-medium truncate pr-2">{user.fullName}</div>
                <span className="text-sm text-zinc-400 shrink-0 ml-auto">
                  {" "}
                  {/* Added ml-auto */}
                  {formatMessageTime(user.lastMessageTime)}
                </span>
              </div>
              <div className="text-sm text-zinc-400 flex items-center justify-between">
                <p className="truncate block"> {user.lastMessage}</p>
                {user.unreadCount > 0 && (
                  <span className="badge badge-sm badge-primary">
                    {user.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            No contacts found
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

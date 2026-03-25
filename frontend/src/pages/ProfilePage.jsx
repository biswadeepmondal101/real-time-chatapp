import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Edit, Loader2, LucideEdit2, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useChatStore } from "../store/useChatStore.js";
import { formatLastSeen } from "../utils/FormatMessageTime.js";

export const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile, checkAuth } =
    useAuthStore();
  const { getUsers } = useChatStore();
  const location = useLocation();
  const isCurrentUser = location.state?.isCurrentUser;

  const user = isCurrentUser ? authUser : location.state?.user;

  const [selectedImg, setSelectedImg] = useState(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [field, setField] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;

      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
      checkAuth();
    };
  };

  const handleUpdate = async (e) => {
    await updateProfile({ [field]: input });
    setInput("");
    await checkAuth();
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="h-screen pt-20">
        <div className="max-w-2xl mx-auto p-4 py-8">
          <div className="bg-base-300 rounded-xl p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold ">Profile</h1>
              <p className="mt-2">Profile information</p>
            </div>

            {/* avatar upload section */}

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImg || user.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4 "
                />
                {isCurrentUser && (
                  <label
                    htmlFor="avatar-upload"
                    className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
                  >
                    <Camera className="w-5 h-5 text-base-200" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                )}
              </div>

              {!isCurrentUser && (
                <p className="text-sm text-zinc-400">
                  {formatLastSeen(user.lastActive)}
                </p>
              )}
              <p className="text-sm text-zinc-400">{user.bio}</p>
              {isCurrentUser && (
                <p
                  onClick={() => {
                    setField("bio");
                    setOpen(true);
                  }}
                  className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors flex gap-1.5"
                >
                  <LucideEdit2 className="w-4 h-4" />
                  {user.bio === "" ? "Add a bio" : "Edit bio"}
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 bg-base-200 rounded-lg border">
                  {/* The Name */}
                  <span className="font-medium">{user?.fullName}</span>

                  {/* The Edit Icon Container */}
                  {isCurrentUser && (
                    <div
                      onClick={() => {
                        setField("fullName");
                        setOpen(true);
                      }}
                      className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors"
                    >
                      <LucideEdit2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-base-300 rounded-xl p-6">
              <h2 className="text-lg font-medium  mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <span>{user.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <input
              type="text"
              placeholder={`Enter ${field} here...`}
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
                disabled={!input.trim()}
                onClick={() => {
                  handleUpdate();
                  setOpen(false);
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfilePage;

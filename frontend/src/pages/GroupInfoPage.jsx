import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Camera,
  Loader2,
  LucideEdit2,
  User,
  UserRoundPlus,
  UserRoundX,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import { useGroupStore } from "../store/useGroupStore.js";

export const GroupInfoPage = () => {
  const { authUser, isUpdatingProfile } = useAuthStore();

  const location = useLocation();
  const isCurrentUser = location.state?.isCurrentUser;

  const [currentGroup, setCurrentGroup] = useState(
    isCurrentUser ? authUser : location.state?.user,
  );

  const {
    members,
    isGroupsLoading,
    getGroupMembers,
    updateGroup,
    getGroup,
    addMember,
    removeMember,
  } = useGroupStore();

  useEffect(() => {
    getGroupMembers(currentGroup._id);
  }, []);

  const isAdmin = currentGroup.admin === authUser._id;
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
      await updateGroup({ groupId: currentGroup._id, profilePic: base64Image });
    };
  };

  const handleUpdate = async (e) => {
    const res = await updateGroup({
      groupId: currentGroup._id,
      [field]: input,
    });
    setInput("");
    setCurrentGroup(res.updatedUser);
  };

  const handleAddMember = async (e) => {
    const res = await addMember({
      groupId: currentGroup._id,
      members: [input],
    });
    setInput("");
    await getGroupMembers(currentGroup._id);
  };

  const handleremoveMember = async (member) => {
    await removeMember({ groupId: currentGroup._id, memberId: member });
    await getGroupMembers(currentGroup._id);
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
              <h1 className="text-2xl font-semibold ">Group Info</h1>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImg || currentGroup.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4 "
                />
                {isAdmin && (
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

              <p className="text-sm text-zinc-400">{currentGroup.bio}</p>
              {isAdmin && (
                <p
                  onClick={() => {
                    setField("bio");
                    setOpen(true);
                  }}
                  className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors flex gap-1.5"
                >
                  <LucideEdit2 className="w-4 h-4" />{" "}
                  {currentGroup.bio === "" ? "Add a bio" : "Edit bio"}
                </p>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    (setOpen(true), setField("members email"));
                  }}
                  className="flex items-center gap-2"
                >
                  <UserRoundPlus className="h-4 w-4" /> Add Members
                </button>
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
                  <span className="font-medium">{currentGroup?.name}</span>

                  {/* The Edit Icon Container */}
                  {isAdmin && (
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
            </div>

            <h2 className="text-lg font-medium  mb-4">Group Members</h2>
            <span className="text-sm text-zinc-500">
              ({members.length} members)
            </span>
            {isGroupsLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[200px] w-full gap-2">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-base-content/60">
                  Loading members...
                </p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member._id}
                  className=" w-full p-2 flex items-center gap-3 hover:bg-base-300 transition-colors border rounded-lg"
                >
                  <div className="relative">
                    <img
                      src={member.profilePic || "./avatar.png"}
                      alt={member.name}
                      className="size-12 object-cover rounded-full"
                    />
                  </div>

                  <div className="hidden lg:block text-left min-w-0 w-full">
                    {" "}
                    <div className="flex items-center justify-between">
                      {" "}
                      <div className="font-medium truncate pr-2">
                        {member.fullName || member.name}
                      </div>
                    </div>
                    <div className="text-sm text-zinc-400 truncate">
                      {member.email}
                    </div>
                  </div>
                  {currentGroup.admin === member._id && (
                    <div className=" text-green-500">Admin</div>
                  )}
                  {isAdmin && !(currentGroup.admin === member._id) && (
                    <button
                      title="Remove User"
                      className="btn btn-sm gap-2 text-red-300 cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => handleremoveMember(member._id)}
                    >
                      <UserRoundX />
                    </button>
                  )}
                </div>
              ))
            )}

            <div className="mt-6 bg-base-300 rounded-xl p-6">
              <h2 className="text-lg font-medium  mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <span>{currentGroup.createdAt?.split("T")[0]}</span>
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
                  if (field === "members email") handleAddMember();
                  else handleUpdate();
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

export default GroupInfoPage;

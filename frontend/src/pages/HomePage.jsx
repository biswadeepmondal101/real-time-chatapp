import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore.js";

export const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <motion.div
      className="h-screen bg-base-200 pt-20p-4"
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="h-screen bg-base-200 pt-20 p-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full h-full">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {selectedUser ? <ChatContainer /> : <NoChatSelected />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;

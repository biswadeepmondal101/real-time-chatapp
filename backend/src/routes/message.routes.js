import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getMessages,
} from "../controllers/message.controllers.js";
import { getAllUsers } from "../controllers/message.controllers.js";

const router = express.Router();

router.get("/all-users", protectRoute, getAllUsers);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;

import express from "express";
import {
  createGroup,
  addGroupMember,
  getGroupMembers,
  updateGroup,
  getGroup,
  removeGroupMember,
} from "../controllers/group.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-group", protectRoute, createGroup);
router.post("/add-member/:id", protectRoute, addGroupMember);
router.get("/get-groupmembers/:id", protectRoute, getGroupMembers);
router.post("/update-group/:id", protectRoute, updateGroup);
router.get("/get-group/:id", protectRoute, getGroup);
router.post("/remove-member/:id", protectRoute, removeGroupMember);

export default router;

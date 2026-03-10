import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  getUser,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/get-user", protectRoute, getUser);

export default router;

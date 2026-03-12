import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  getUser,
  addContact,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/get-user", protectRoute, getUser);
router.post("/add-contact", protectRoute, addContact);

export default router;

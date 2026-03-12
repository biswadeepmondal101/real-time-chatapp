import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import Conversation from "../models/conversation.model.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required!!!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "user already exist!!!" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashPassword });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        message: "user created successfully",
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(500).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Eeeor in signup", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!!!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!!!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials!!!" });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      message: "user logged in successfully",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "user logged out successfully" });
  } catch (error) {
    console.log("Error in logout", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    const updateData = {};

    if (bio) {
      updateData.bio = bio;
    }

    if (fullName) {
      updateData.fullName = fullName;
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    return res.status(200).json({
      updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log("Error in updateProfile", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUser", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addContact = async (req, res) => {
  const { email } = req.body;
  const userId = req.user._id;
  try {
    if (!email) {
      return res.status(400).json({ message: "Please provided an email" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not exits with this email" });
    }

    if (user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { contact: user._id } },
      { new: true },
    );

    await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { contact: userId } },
      { new: true },
    );

    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, user._id] },
    });

    if (!existingConversation) {
      const newConversation = new Conversation({
        participants: [userId, user._id],
      });

      await newConversation.save();
    }
    return res.status(200).json({
      updatedUser,
      message: "New contact added!!!",
    });
  } catch (error) {
    console.log("Error in addcontact", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

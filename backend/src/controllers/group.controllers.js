import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";

export const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id).populate("members", "fullName");
    return res.status(200).json(group);
  } catch (error) {
    console.log("Error in getGroup", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createGroup = async (req, res) => {
  const { name, groupUser } = req.body;
  const admin = req.user._id;

  const email = groupUser[0];

  // find user by email
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    return res.status(404).json({ message: "User not found" });
  }
  const members = [admin, userToAdd._id];
  try {
    const group = new Group({
      name,
      members,
      admin,
    });
    await group.save();

    await Promise.all(
      members.map((member) =>
        User.findByIdAndUpdate(
          member,
          { $addToSet: { groups: group._id } },
          { new: true },
        ),
      ),
    );

    return res.status(200).json({
      group,
      message: "Group created successfully",
    });
  } catch (error) {
    console.log("Error in createGroup", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addGroupMember = async (req, res) => {
  try {
    const { members } = req.body;
    const { id: groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: "Group id is required" });
    }

    const email = members[0];

    // find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = await Group.findById(groupId);

    const isAlreadyMember = group.members.some((id) =>
      id.equals(userToAdd._id),
    );

    if (isAlreadyMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this group" });
    }

    // add member to group
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $addToSet: { members: userToAdd._id },
      },
      { new: true },
    );

    // add group to user
    await User.findByIdAndUpdate(userToAdd._id, {
      $addToSet: { groups: group._id },
    });

    return res.status(200).json({
      updatedGroup,
      message: "Member added successfully",
    });
  } catch (error) {
    console.log("Error in addGroupMember", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const { id: groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      "members",
      "fullName profilePic email",
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    return res.status(200).json(group.members);
  } catch (error) {
    console.log("Error in getGroupMembers", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const { id: groupId } = req.params;

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

    const updatedUser = await Group.findByIdAndUpdate(groupId, updateData, {
      new: true,
    });

    return res.status(200).json({
      updatedUser,
      message: "Group updated successfully",
    });
  } catch (error) {
    console.log("Error in updateProfile", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const { id: groupId } = req.params;

    if (!groupId || !memberId) {
      return res
        .status(400)
        .json({ message: "GroupId and MemberId are required" });
    }

    // remove user from group
    await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: { members: memberId },
      },
      { new: true },
    );

    // remove group from user's groups list
    await User.findByIdAndUpdate(
      memberId,
      {
        $pull: { groups: groupId },
      },
      { new: true },
    );

    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.log("Error in removeGroupMember", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

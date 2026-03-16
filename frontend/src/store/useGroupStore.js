import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";

export const useGroupStore = create((set) => ({
  currentGroup: null,
  members: [],
  isGroupsLoading: false,

  getGroup: async (groupId) => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get(`/group/get-group/${groupId}`);
      set({ currentGroup: res.data });
      console.log("currentGroup", res.data);
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/group/create-group", data);
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getGroupMembers: async (userId) => {
    set({ isGroupsLoading: true });
    console.log("userId", userId);

    try {
      const res = await axiosInstance.get(`/group/get-groupmembers/${userId}`);
      set({ members: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  addMember: async (data) => {
    const { groupId, ...restData } = data;
    try {
      const res = await axiosInstance.post(
        `/group/add-member/${groupId}`,
        restData,
      );
      toast.success("Member added successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  removeMember: async (data) => {
    const { groupId, ...restData } = data;
    try {
      const res = await axiosInstance.post(
        `/group/remove-member/${groupId}`,
        restData,
      );
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateGroup: async (data) => {
    const { groupId, ...restData } = data;
    try {
      const res = await axiosInstance.post(
        `/group/update-group/${groupId}`,
        restData,
      );
      toast.success("Group updated successfully");
      console.log("updatedGroup", res.data);
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
}));

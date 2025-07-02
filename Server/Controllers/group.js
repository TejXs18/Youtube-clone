import Group from "../models/group.js";
import User from "../models/user.js";

// Create a group
export const createGroup = async (req, res) => {
  const { name } = req.body;
  try {
    const group = new Group({ name, members: [req.userId], createdBy: req.userId });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add member to group
export const addMember = async (req, res) => {
  const { groupId, userIdToAdd } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group.members.includes(userIdToAdd)) {
      group.members.push(userIdToAdd);
      await group.save();
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search groups
export const searchGroups = async (req, res) => {
  const { query } = req.query;
  try {
    const groups = await Group.find({ name: { $regex: query, $options: 'i' } });
    res.status(200).json(groups);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('members', 'name email');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

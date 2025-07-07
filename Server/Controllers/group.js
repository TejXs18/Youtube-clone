import Group from "../Models/group.js";
import User from "../Models/Auth.js";

// Create a group
export const createGroup = async (req, res) => {
  const { name, description } = req.body;
  try {
    const group = new Group({ 
      name, 
      description: description || '',
      members: [req.userId], 
      createdBy: req.userId 
    });
    await group.save();
    const populatedGroup = await Group.findById(group._id).populate('members', 'name email');
    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add member to group by email
export const addMember = async (req, res) => {
  const { groupId, email } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Find group and add member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is already a member
    if (group.members.includes(user._id)) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    // Add user to group
    group.members.push(user._id);
    await group.save();
    
    const populatedGroup = await Group.findById(groupId).populate('members', 'name email');
    res.status(200).json({ 
      message: `${user.name} has been added to the group!`,
      group: populatedGroup 
    });
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

const router = require('express').Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');

// Get groups for current user
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.userId }).populate('members', 'username').populate('admins', 'username');
    const formatted = groups.map(g => ({ id: g._id.toString(), name: g.name, members: g.members.map(m => ({ id: m._id.toString(), username: m.username })), admins: g.admins.map(a => ({ id: a._id.toString(), username: a.username })) }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new group
router.post('/', auth, async (req, res) => {
  try {
    const { name, members = [] } = req.body;
    const group = new Group({ name, members: [...new Set([req.userId, ...members])], admins: [req.userId] });
    await group.save();
    res.status(201).json({ id: group._id.toString(), name: group.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to group
router.post('/:groupId/members', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.json({ message: 'Member added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', auth, async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.members = group.members.filter(m => m.toString() !== userId.toString());
    group.admins = group.admins.filter(a => a.toString() !== userId.toString());
    await group.save();

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

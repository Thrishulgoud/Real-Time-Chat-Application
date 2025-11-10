const router = require('express').Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Group = require('../models/Group');

// Get messages for a one-on-one chat
router.get('/direct/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username');

    // Decrypt messages
    const decryptedMessages = messages.map(msg => ({
      ...msg.toJSON(),
      content: msg.decryptMessage()
    }));

    res.json(decryptedMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a group chat
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group.members.includes(req.userId)) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const messages = await Message.find({
      group: req.params.groupId
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username');

    // Decrypt messages
    const decryptedMessages = messages.map(msg => ({
      ...msg.toJSON(),
      content: msg.decryptMessage()
    }));

    res.json(decryptedMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.post('/read', auth, async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: { user: req.userId } } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
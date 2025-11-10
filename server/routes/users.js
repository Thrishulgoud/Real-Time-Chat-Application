const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get online users
router.get('/online', auth, async (req, res) => {
  try {
    const users = await User.find({ isOnline: true }).select('_id username');
    const formatted = users.map(u => ({ id: u._id.toString(), username: u.username }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id.toString(), username: user.username, email: user.email, isOnline: user.isOnline, lastSeen: user.lastSeen });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

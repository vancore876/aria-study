const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

router.get('/', [authMiddleware, isAdmin], async (req, res) => {
  try {
    const users = await User.find()
      .select('email username subscription')
      .populate('subscription', 'planId status');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', [authMiddleware, isAdmin], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', [authMiddleware, isAdmin], async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

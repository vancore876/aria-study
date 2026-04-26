const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stats = require('../models/Stats');

// Admin authentication middleware
const authAdmin = (req, res, next) => {
  // In production, verify admin token here
  next();
};

router.get('/stats', authAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const userCount = await User.countDocuments();
    const activeNow = await User.countDocuments({ lastActive: { $gte: fifteenMinutesAgo } });
    const activeToday = await User.countDocuments({ lastLogin: { $gte: startOfToday } });
    const signupsToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });
    const plusSubscribers = await User.countDocuments({ subscription: 'plus' });
    const proSubscribers = await User.countDocuments({ subscription: 'pro' });
    const stats = await Stats.findOne().sort({ date: -1 }).limit(1);

    res.json({
      users: userCount,
      activeNow,
      activeToday,
      signupsToday,
      plusSubscribers,
      proSubscribers,
      revenue: stats ? stats.totalRevenue : '$0'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;

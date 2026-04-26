const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/auth');

router.get('/usage', authMiddleware, async (req, res) => {
  try {
    const [userCount, activeSubscriptions, usageStats] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      User.aggregate([
        { $match: { 'activityLog.action': { $ne: null } } },
        { $unwind: '$activityLog' },
        { 
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            averageDailyActions: { 
              $avg: {
                $divide: [
                  { $subtract: [new Date(), '$activityLog.timestamp'] },
                  86400000 // milliseconds in a day
                ]
              } 
            }
          }
        }
      ])
    ]);

    res.json({
      userCount,
      activeSubscriptions,
      usageStats: usageStats[0] || { totalActions: 0, averageDailyActions: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

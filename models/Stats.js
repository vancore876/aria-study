const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  totalUsers: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  totalRevenue: { type: String, default: '$0' },
  proSubscribers: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stats', statsSchema);

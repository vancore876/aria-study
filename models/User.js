const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscription: {
    type: String,
    enum: ['free', 'plus', 'pro'],
    default: 'free'
  },
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  isLoggedIn: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  studyStats: {
    totalSessions: { type: Number, default: 0 },
    avgSessionTime: { type: Number, default: 0 },
    subjects: { type: [String], default: [] }
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

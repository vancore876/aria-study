const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  knowledgeGraph: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeNode' }],
  activityLog: [{
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

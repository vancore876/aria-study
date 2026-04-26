const mongoose = require('mongoose');

const pastPaperSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  year: { type: Number, required: true },
  level: { type: String, enum: ['O-Level', 'A-Level', 'College'], required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  downloads: { type: Number, default: 0 }
});

module.exports = mongoose.model('PastPaper', pastPaperSchema);

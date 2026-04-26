const mongoose = require('mongoose');

const knowledgeNodeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: Number, required: true }, // 1 for basic, 2 for advanced
  content: { type: String, required: true },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeNode' }],
  relatedPapers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PastPaper' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KnowledgeNode', knowledgeNodeSchema);

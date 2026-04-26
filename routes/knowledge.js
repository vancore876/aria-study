const express = require('express');
const router = express.Router();
const KnowledgeNode = require('../models/KnowledgeNode');
const auth = require('../middleware/auth');

router.get('/tree', async (req, res) => {
  try {
    const nodes = await KnowledgeNode.find()
      .populate('prerequisites')
      .populate('relatedPapers');
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch knowledge tree' });
  }
});

router.get('/level/:level', async (req, res) => {
  try {
    const nodes = await KnowledgeNode.find({ level: Number(req.params.level) })
      .populate('prerequisites')
      .populate('relatedPapers');
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch knowledge level' });
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    const node = new KnowledgeNode(req.body);
    await node.save();
    res.status(201).json(node);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create knowledge node' });
  }
});

module.exports = router;

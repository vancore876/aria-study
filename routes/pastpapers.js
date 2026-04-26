const express = require('express');
const router = express.Router();
const PastPaper = require('../models/PastPaper');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const papers = await PastPaper.find().sort({ uploadDate: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch past papers' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const paper = new PastPaper({
      ...req.body,
      uploadedBy: req.user.id
    });
    await paper.save();
    res.status(201).json(paper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload paper' });
  }
});

module.exports = router;

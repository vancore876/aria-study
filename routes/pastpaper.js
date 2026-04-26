const express = require('express');
const router = express.Router();
const PastPaperController = require('../controllers/PastPaperController');

router.post('/create', PastPaperController.createPastPaper);
router.get('/all', PastPaperController.getPastPapers);

module.exports = router;

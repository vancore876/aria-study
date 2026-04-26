const PastPaper = require('../models/PastPaper');

class PastPaperController {
  async createPastPaper(req, res) {
    try {
      const { subject, year, questions } = req.body;
      const pastPaper = new PastPaper(null, subject, year, questions);
      // Save past paper to database
      // ...

      res.status(201).json(pastPaper);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create past paper' });
    }
  }

  async getPastPapers(req, res) {
    try {
      const filter = {};
      if (req.query.level) filter.level = req.query.level;
      const pastPapers = await PastPaper.find(filter);
      res.json(pastPapers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve past papers' });
    }
  }
}

module.exports = PastPaperController;

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// General News
router.get('/general', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 }).limit(50);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Filtered News (Smart)
router.post('/filtered', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.portfolio.length === 0) {
      return res.json([]);
    }
    const allKeywords = [...new Set(user.portfolio.flatMap(item => item.keywords))];
    if (allKeywords.length === 0) return res.json([]);
    
    const searchRegex = new RegExp(allKeywords.join('|'), 'i');
    const articles = await Article.find({ headline: searchRegex }).sort({ publishedAt: -1 }).limit(50);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

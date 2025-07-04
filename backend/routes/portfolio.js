const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Get user's portfolio
// @route   POST /api/portfolio
router.post('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, portfolio: user.portfolio });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Manually update user's portfolio
// @route   PUT /api/portfolio
router.put('/', protect, async (req, res) => {
    const { portfolioSymbols } = req.body; 

    try {
        const newPortfolio = portfolioSymbols.map(symbol => ({
            symbol: symbol,
            keywords: [symbol] 
        }));

        const user = await User.findByIdAndUpdate(req.user.id, { portfolio: newPortfolio }, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, portfolio: user.portfolio });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
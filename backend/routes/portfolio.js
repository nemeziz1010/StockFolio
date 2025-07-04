const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // Import the protect middleware

// @desc    Get user's portfolio
// @route   POST /api/portfolio
// We use POST to easily send the token in the body for this example.
router.post('/', protect, async (req, res) => {
  try {
    // The user object is attached to the request by the 'protect' middleware
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      portfolio: user.portfolio,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Update user's portfolio
// @route   PUT /api/portfolio
router.put('/', protect, async (req, res) => {
  const { portfolio } = req.body;

  try {
    const user = await User.findByIdAndUpdate(req.user.id, { portfolio }, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      portfolio: user.portfolio,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

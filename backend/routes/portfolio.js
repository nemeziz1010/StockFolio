const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, portfolio: user.portfolio });
});

module.exports = router;
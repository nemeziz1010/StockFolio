const express = require('express');
const router = express.Router();
const { KiteConnect } = require("kiteconnect");
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper function to extract keywords from a stock's name
const extractKeywords = (instrumentName) => {
    const stopWords = new Set(['THE', 'AND', 'PRIVATE', 'LIMITED', 'LTD', 'INDIA', 'CORPORATION', 'CORP', 'ETF']);
    return instrumentName
        .toUpperCase()
        .split(/[\s,.-]+/) 
        .filter(word => word.length > 2 && !stopWords.has(word));
};

router.post('/connect', protect, (req, res) => {
  try {
    req.session.userId = req.user.id;
    req.session.save(err => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).json({ success: false, message: 'Failed to save session before redirect.' });
      }
      const kc = new KiteConnect({ api_key: process.env.ZERODHA_API_KEY });
      const authUrl = kc.getLoginURL();
      res.status(200).json({ success: true, authUrl });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate login URL.' });
  }
});

router.get('/callback', async (req, res) => {
    const { request_token } = req.query;
    const userId = req.session.userId;
    if (!request_token) return res.status(400).send('<h1>Error: Zerodha request token not found.</h1>');
    if (!userId) return res.status(400).send('<h1>Error: User session could not be found. Please try logging in again.</h1>');
    try {
        const kc = new KiteConnect({ api_key: process.env.ZERODHA_API_KEY });
        const session = await kc.generateSession(request_token, process.env.ZERODHA_API_SECRET);
        await User.findByIdAndUpdate(userId, { zerodhaAccessToken: session.access_token });
        req.session.destroy();
        res.redirect(`${process.env.FRONTEND_URL}/portfolio?broker_linked=true`);
    } catch (error) {
        res.status(500).send(`<h1>Failed to link Zerodha account.</h1><p>${error.message}</p>`);
    }
});

router.post('/status', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, isLinked: !!user.zerodhaAccessToken });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


// @desc    Sync portfolio from Zerodha with keyword extraction
// @route   POST /api/broker/sync-portfolio
router.post('/sync-portfolio', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.zerodhaAccessToken) {
            return res.status(400).json({ success: false, message: 'Zerodha account not linked.' });
        }
        
        const kc = new KiteConnect({ api_key: process.env.ZERODHA_API_KEY });
        kc.setAccessToken(user.zerodhaAccessToken);
        
        const holdings = await kc.getHoldings();
        const newPortfolio = [];

        for (const holding of holdings) {
            const symbol = holding.tradingsymbol;
            let keywords = [symbol]; 

            try {
                const instruments = await kc.getInstruments(["NSE"]); 
                const instrumentData = instruments.find(inst => inst.tradingsymbol === symbol);
                
                if (instrumentData && instrumentData.name) {
                    const nameKeywords = extractKeywords(instrumentData.name);
                    keywords = [...new Set([...keywords, ...nameKeywords])];
                }
            } catch (instError) {
                console.error(`Could not fetch instrument details for ${symbol}:`, instError.message);
            }
            
            newPortfolio.push({ symbol, keywords });
        }
        
        user.portfolio = newPortfolio;
        await user.save();
        
        res.status(200).json({ success: true, portfolio: user.portfolio });
    } catch (error) {
        console.error(`Error syncing portfolio:`, error.message);
        res.status(500).json({ success: false, message: `Failed to sync portfolio.` });
    }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const connectDB = require('./db');
const scrapeNews = require('./scraper');
const { analyzeHeadline } = require('./aiAnalysis');
const Article = require('./models/Article');
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const brokerRoutes = require('./routes/broker');

const app = express();
const PORT = process.env.PORT || 4000;

// --- CORS MIDDLEWARE SETUP ---
app.use(cors({
    origin: process.env.FRONTEND_URL, // e.g., 'http://localhost:5173'
    credentials: true
}));

app.use(express.json());

// Connect to database and get the client promise before setting up session
const clientPromise = connectDB();

// --- SESSION MIDDLEWARE SETUP ---
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // Important: ensures session is saved on first request
    store: MongoStore.create({ 
        clientPromise: clientPromise,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 15, // Session timeout: 15 minutes
        sameSite: 'lax', // Recommended for this OAuth flow
        // secure: false // Set to true if using HTTPS in production
    }
}));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/broker', brokerRoutes);

// ... (rest of server.js is unchanged) ...
app.get('/api/news/general', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 }).limit(50);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});
app.get('/api/news/filtered', async (req, res) => {
  try {
    const { stocks } = req.query;
    if (!stocks) {
      return res.status(400).json({ message: 'Stock symbols are required.' });
    }
    const stockList = stocks.split(',');
    const searchRegex = new RegExp(stockList.join('|'), 'i');
    const articles = await Article.find({ headline: searchRegex })
      .sort({ publishedAt: -1 })
      .limit(50);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});
const runAnalysisWorker = async () => {
    console.log('Running AI Analysis Worker...');
    try {
        const articlesToAnalyze = await Article.find({ aiAnalysis: { $exists: false } }).limit(10);
        if (articlesToAnalyze.length === 0) {
            console.log('No new articles to analyze.');
            return;
        }
        console.log(`Found ${articlesToAnalyze.length} articles to analyze.`);
        for (const article of articlesToAnalyze) {
            const analysis = await analyzeHeadline(article.headline);
            if (analysis) {
                article.aiAnalysis = analysis;
                await article.save();
                console.log(`Successfully analyzed and saved: "${article.headline}"`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } catch (error) {
        console.error('Error in AI Analysis Worker:', error);
    }
};
cron.schedule('*/30 * * * *', async () => {
  console.log('Running scheduled scrape job...');
  await scrapeNews();
  await runAnalysisWorker();
});
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  (async () => {
    await scrapeNews();
    await runAnalysisWorker();
  })();
});

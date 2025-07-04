
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
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const brokerRoutes = require('./routes/broker');
const { protect } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

const clientPromise = connectDB();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        clientPromise: clientPromise,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 15, // 15 minutes
        secure: true, 
        httpOnly: true,
        sameSite: 'none' 
    }
}));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/broker', brokerRoutes);

// General News Route
app.get('/api/news/general', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 }).limit(50);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Filtered News (Smart) Route
app.post('/api/news/filtered', protect, async (req, res) => {
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


const runAnalysisWorker = async () => {
    console.log('Running AI Analysis Worker...');
    try {
        // Find up to 10 articles that have not been analyzed yet
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
            // Add a small delay to avoid hitting API rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } catch (error) {
        console.error('Error in AI Analysis Worker:', error);
    }
};

// --- Scheduled Cron Job ---
cron.schedule('*/30 * * * *', async () => {
  console.log('Running scheduled scrape job...');
  await scrapeNews();
  await runAnalysisWorker();
});


// --- Main Server Start ---
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    
    // Run the scraper and AI worker once on initial startup.
    (async () => {
      console.log('Running initial scrape and analysis on startup...');
      await scrapeNews();
      await runAnalysisWorker();
    })();
});

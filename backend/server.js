const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

// Load environment variables at the very top
require('dotenv').config();

const connectDB = require('./db');
const scrapeNews = require('./scraper');
const { analyzeHeadline } = require('./aiAnalysis');
const Article = require('./models/Article');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

connectDB();

// --- AI Analysis Worker ---
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
            await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay slightly
        }
    } catch (error) {
        console.error('Error in AI Analysis Worker:', error);
    }
};


// --- API Routes (No changes needed here for now) ---
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


// --- Scheduled Jobs ---
// Schedule the scraper to run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('Running scheduled scrape job...');
  await scrapeNews();
  // Run the analysis worker immediately after scraping
  await runAnalysisWorker();
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  // Initial run on start-up
  (async () => {
    await scrapeNews();
    await runAnalysisWorker();
  })();
});

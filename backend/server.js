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
        maxAge: 1000 * 60 * 15,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/broker', brokerRoutes);
app.use('/api/news', require('./routes/news')); // Consolidated news routes

// --- Main Server Start ---
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    // Optional: Initial scrape on start
    // scrapeNews();
    // runAnalysisWorker();
});

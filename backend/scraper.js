
const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('./models/Article');

// --- Scraper for Moneycontrol ---
const scrapeMoneycontrol = async () => {
  const url = 'https://www.moneycontrol.com/news/business/markets/';
  try {
    console.log('Scraping Moneycontrol...');
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];

    // Using the selector logic that you confirmed is working.
    $('#cagetory li.clearfix').each((i, el) => {
      const headline = $(el).find('h2 a').attr('title');
      const articleUrl = $(el).find('h2 a').attr('href');
      
      if (headline && articleUrl) {
        articles.push({
          headline,
          url: articleUrl,
          source: 'Moneycontrol',
        });
      }
    });
    console.log(`Found ${articles.length} articles from Moneycontrol.`);
    return articles;
  } catch (error) {
    console.error(`Error scraping Moneycontrol: ${error.message}`);
    return []; // Return empty array on error
  }
};

// --- Scraper for The Economic Times ---
const scrapeEconomicTimes = async () => {
  const url = 'https://economictimes.indiatimes.com/markets/stocks/news';
  try {
    console.log('Scraping The Economic Times...');
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    const baseUrl = 'https://economictimes.indiatimes.com';

    $('div.eachStory').each((i, el) => {
      const headline = $(el).find('h3 a').text().trim();
      let articleUrl = $(el).find('h3 a').attr('href');
      if (headline && articleUrl) {
        // Prepend base URL if the link is relative
        if (!articleUrl.startsWith('http')) {
          articleUrl = baseUrl + articleUrl;
        }
        articles.push({
          headline,
          url: articleUrl,
          source: 'The Economic Times',
        });
      }
    });
    console.log(`Found ${articles.length} articles from The Economic Times.`);
    return articles;
  } catch (error) {
    console.error(`Error scraping The Economic Times: ${error.message}`);
    return []; // Return empty array on error
  }
};

// --- Main Scraper Function ---
const scrapeNews = async () => {
  console.log('--- Starting News Scrape from All Sources ---');
  
  // Run all scrapers concurrently and wait for them to finish
  const allArticles = await Promise.all([
    scrapeMoneycontrol(),
    scrapeEconomicTimes(),
  ]);

  // Flatten the array of arrays into a single array of articles
  const combinedArticles = allArticles.flat();
  
  console.log(`Found a total of ${combinedArticles.length} articles.`);

  if (combinedArticles.length === 0) {
    console.log("No articles found from any source.");
    return;
  }

  // Save articles to the database, avoiding duplicates
  let newArticlesCount = 0;
  for (const articleData of combinedArticles) {
    try {
      const existingArticle = await Article.findOne({ url: articleData.url });
      if (!existingArticle) {
        const newArticle = new Article(articleData);
        await newArticle.save();
        newArticlesCount++;
      }
    } catch (dbError) {
        console.error(`Error saving article "${articleData.headline}": ${dbError.message}`);
    }
  }
  console.log(`--- Scrape Complete. Added ${newArticlesCount} new articles to the database. ---`);
};

module.exports = scrapeNews;
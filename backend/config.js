const OpenAI = require('openai');

// The dotenv config will be called from server.js, so we can use process.env here
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;

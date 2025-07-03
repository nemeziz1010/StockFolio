const mongoose = require('mongoose');

const AIAnalysisSchema = new mongoose.Schema({
  impact: { 
    type: String, 
    enum: ['Positive', 'Negative', 'Neutral'], // Restrict values
    required: true 
  },
  reasoning: { type: String, required: true },
  // Add the new confidence field
  confidence: { type: Number, required: true, min: 0, max: 1 },
}, { _id: false }); // No separate ID for this sub-document

const ArticleSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  aiAnalysis: { type: AIAnalysisSchema, required: false },
});

module.exports = mongoose.model('Article', ArticleSchema);

// File: /backend/aiAnalysis.js (Updated)
// Purpose: Makes the AI response handling more robust to handle both simple and complex multi-entity headlines.

const openai = require('./config');

const analyzeHeadline = async (headline) => {
  try {
    const systemPrompt = `You are a financial analyst providing data for an API. Analyze the news headline and provide a structured JSON response.
- If the headline refers to a single entity, provide a root-level object with 'impact', 'reasoning', and 'confidence'.
- If the headline refers to multiple entities with different impacts, provide a root-level 'entities' object. Each key should be the entity name, with a nested object containing its 'impact', 'reasoning', and 'confidence'.
- 'impact' must be "Positive", "Negative", or "Neutral".
- 'reasoning' must be a direct, concise financial reason.
- 'confidence' must be a number between 0.0 and 1.0.
Output only the raw JSON object.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this headline: "${headline}"` }
      ],
      response_format: { type: "json_object" },
    });

    let analysisResult;
    try {
      analysisResult = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error(`Error parsing JSON from AI for headline "${headline}":`, parseError.message);
      throw new Error("Invalid JSON format received from AI.");
    }

    // --- NEW LOGIC TO HANDLE SIMPLE OR COMPLEX RESPONSES ---

    // Case 1: Simple, single-entity response
    if (analysisResult.impact && analysisResult.reasoning && typeof analysisResult.confidence === 'number') {
      console.log(`Received simple analysis for: "${headline}"`);
      return analysisResult;
    }

    // Case 2: Complex, multi-entity response
    if (analysisResult.entities && typeof analysisResult.entities === 'object') {
      console.log(`Received complex multi-entity analysis for: "${headline}"`);
      const entities = Object.values(analysisResult.entities);
      if (entities.length === 0) {
        throw new Error("Received empty entities object from AI.");
      }

      // Determine overall impact by majority or priority
      const impactCounts = entities.reduce((acc, entity) => {
        acc[entity.impact] = (acc[entity.impact] || 0) + 1;
        return acc;
      }, {});

      let overallImpact = 'Neutral';
      if (impactCounts.Positive > impactCounts.Negative) {
        overallImpact = 'Positive';
      } else if (impactCounts.Negative > impactCounts.Positive) {
        overallImpact = 'Negative';
      }
      
      // Combine reasoning and average confidence
      const combinedReasoning = entities.map(e => `${Object.keys(analysisResult.entities).find(k => analysisResult.entities[k] === e)}: ${e.reasoning}`).join('; ');
      const averageConfidence = entities.reduce((acc, e) => acc + e.confidence, 0) / entities.length;

      return {
        impact: overallImpact,
        reasoning: combinedReasoning,
        confidence: averageConfidence,
      };
    }

    // If neither format matches, throw an error.
    console.error("Received malformed but valid JSON from AI:", analysisResult);
    throw new Error("Invalid data structure received from AI.");

  } catch (error) {
    console.error(`Error analyzing headline "${headline}":`, error.message);
    return null; 
  }
};

module.exports = { analyzeHeadline };

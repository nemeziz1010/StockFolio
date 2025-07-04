
const openai = require('./config');

const analyzeHeadline = async (headline) => {
  try {
    const systemPrompt = `You are a financial analyst providing data for an API. Analyze the news headline and provide a structured JSON response.
- 'impact' must be "Positive", "Negative", or "Neutral".
- 'reasoning' must be a direct, concise financial reason for the impact.
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
      // Safely parse the JSON response
      analysisResult = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error(`Error parsing JSON from AI for headline "${headline}":`, parseError.message);
      throw new Error("Invalid JSON format received from AI.");
    }

    if (
        analysisResult &&
        ['Positive', 'Negative', 'Neutral'].includes(analysisResult.impact) && 
        analysisResult.reasoning &&
        typeof analysisResult.confidence === 'number'
    ) {
      return analysisResult;
    } else {
      console.error("Received malformed but valid JSON from AI:", analysisResult);
      throw new Error("Invalid data structure received from AI.");
    }

  } catch (error) {
    console.error(`Error analyzing headline "${headline}":`, error.message);
    return null; 
  }
};

module.exports = { analyzeHeadline };

const openai = require('./config');

const analyzeHeadline = async (headline) => {
  try {
    const systemPrompt = `You are a financial analyst providing data for an API. Analyze the news headline and provide a structured JSON response.
- 'impact' must be "Positive", "Negative", or "Neutral".
- 'reasoning' must be a direct, concise financial reason for the impact. Do not use conversational phrases like "The headline suggests".
- 'confidence' must be a number between 0.0 and 1.0.
Output only the raw JSON object.`;

    const completion = await openai.chat.completions.create({
      // *** THIS IS THE FIX: Use a model that supports JSON mode ***
      model: "gpt-4-turbo", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this headline: "${headline}"` }
      ],
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    // Updated validation to check for the confidence score
    if (
        ['Positive', 'Negative', 'Neutral'].includes(analysisResult.impact) && 
        analysisResult.reasoning &&
        typeof analysisResult.confidence === 'number'
    ) {
      return analysisResult;
    } else {
      throw new Error("Invalid format received from AI.");
    }

  } catch (error) {
    console.error(`Error analyzing headline "${headline}":`, error);
    return null;
  }
};

module.exports = { analyzeHeadline };

const axios = require("axios");

exports.analyzeReviewsWithAI = async (reviews) => {
    try {
        const reviewTexts = reviews.map((r) => r.Comment);

        const prompt = `
        Analyze these restaurant reviews and return ONLY JSON in this format:

        {
          "sentiment": "positive | negative | mixed",
          "summaryBullets": ["point1", "point2", "point3"],
          "topMentions": ["word1", "word2"]
        }

        Reviews: ${reviewTexts.join("\n")}
        `;
    const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
    },
    {
        headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
    }
);

const raw = response.data.choices[0].message.content.trim();
const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
return JSON.parse(jsonText);

}catch(error){
    console.error("AI error",error);
    throw error;

}
};
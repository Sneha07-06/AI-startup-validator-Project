const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/startupvalidator")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Auth and Ideas routes
const authRoutes = require('./routes/auth');
const ideaRoutes = require('./routes/ideas');
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);

// Validate route
app.post('/api/validate', async (req, res) => {
  const { idea, industry, audience, budget, country } = req.body;

  const prompt = `You are a startup idea validator. Analyze this startup idea and respond in JSON format only. No extra text, no markdown, just pure JSON.

Startup Idea: ${idea}
Industry: ${industry}
Target Audience: ${audience}
Budget: ${budget}
Country/Market: ${country}

Respond with this exact JSON structure:
{
  "score": 7.5,
  "successChance": "High",
  "marketDemand": "one sentence about market demand",
  "competitors": ["competitor1", "competitor2", "competitor3"],
  "swot": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "opportunities": ["opportunity1", "opportunity2"],
    "threats": ["threat1", "threat2"]
  },
  "revenueModels": ["model1", "model2", "model3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-20b",
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    console.log("Groq raw response:", text);
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);

  } catch (err) {
    console.error("Full error:", err.message);
    res.status(500).json({ error: "AI analysis failed", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
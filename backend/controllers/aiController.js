const Groq = require('groq-sdk');
const { uploadToCloudinary } = require('../config/cloudinary');

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

exports.identifySeed = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required.' });
    }

    const groq = getGroq();
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const lang = req.body.lang || 'English';

    // Upload to Cloudinary
    let imageUrl = null;
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'seedswap/ai-uploads',
      });
      imageUrl = uploadResult.secure_url;
    } catch (uploadErr) {
      console.warn('Cloudinary upload skipped:', uploadErr.message);
    }

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert botanist and seed identification specialist.
Analyze this seed image carefully and provide the following information in JSON format only (no markdown, no extra text).
IMPORTANT: Write ALL text values in ${lang} language only. Do not use English unless ${lang} is English.
{
  "seedName": "common name of the seed in ${lang}",
  "scientificName": "scientific/botanical name (keep in Latin)",
  "description": "detailed description in ${lang} (2-3 sentences)",
  "confidence": "high/medium/low",
  "plantingTips": {
    "soilType": "recommended soil type in ${lang}",
    "sunlight": "sunlight requirements in ${lang}",
    "watering": "watering schedule in ${lang}",
    "spacing": "spacing between plants in ${lang}",
    "depth": "planting depth in ${lang}",
    "season": "best planting season in ${lang}"
  },
  "growthTime": "approximate time from seed to harvest/bloom in ${lang}",
  "difficulty": "easy/moderate/advanced in ${lang}",
  "additionalNotes": "any special care tips in ${lang}"
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1024,
    });

    const responseText = response.choices[0]?.message?.content || '';
    let seedData;

    try {
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      seedData = JSON.parse(cleanedText);
    } catch {
      seedData = {
        seedName: 'Unknown Seed',
        scientificName: 'Unknown',
        description: responseText,
        confidence: 'low',
        plantingTips: {},
        growthTime: 'Unknown',
        difficulty: 'Unknown',
        additionalNotes: '',
      };
    }

    res.json({ success: true, data: seedData, imageUrl });
  } catch (error) {
    console.error('Seed identification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGrowingRecommendations = async (req, res) => {
  try {
    const { seedType, location, climate, lang = 'English' } = req.body;

    if (!seedType || !location) {
      return res.status(400).json({ success: false, message: 'Seed type and location are required.' });
    }

    const groq = getGroq();

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are an expert agricultural advisor and botanist.
Provide detailed growing recommendations for ${seedType} seeds in ${location}${climate ? ` with ${climate} climate` : ''}.
IMPORTANT: Write ALL text values in ${lang} language only. Do not use English unless ${lang} is English.
Respond in JSON format only (no markdown, no extra text):
{
  "seedType": "${seedType}",
  "location": "${location}",
  "overview": "2-3 sentence overview in ${lang}",
  "plantingSeason": {
    "bestMonths": ["month names in ${lang}"],
    "secondaryMonths": ["month names in ${lang}"],
    "avoidMonths": ["month names in ${lang}"]
  },
  "soilPreparation": {
    "type": "ideal soil type in ${lang}",
    "ph": "ideal pH range",
    "amendments": "recommended soil amendments in ${lang}"
  },
  "wateringSchedule": {
    "frequency": "how often to water in ${lang}",
    "amount": "how much water per session in ${lang}",
    "tips": "special watering tips in ${lang}"
  },
  "sunlightNeeds": "sunlight requirements in ${lang}",
  "fertilization": "fertilization recommendations in ${lang}",
  "pestAndDisease": "common pests/diseases and prevention in ${lang}",
  "harvestTime": "when and how to harvest in ${lang}",
  "yieldExpectation": "expected yield per plant/area in ${lang}",
  "tips": ["tip1 in ${lang}", "tip2 in ${lang}", "tip3 in ${lang}"]
}`,
        },
      ],
      max_tokens: 1500,
    });

    const responseText = response.choices[0]?.message?.content || '';
    let recommendations;

    try {
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      recommendations = JSON.parse(cleanedText);
    } catch {
      recommendations = { overview: responseText, seedType, location };
    }

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Growing recommendations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlantingCalendar = async (req, res) => {
  try {
    const { seedType, location, lang = 'English' } = req.body;

    if (!seedType || !location) {
      return res.status(400).json({ success: false, message: 'Seed type and location are required.' });
    }

    const groq = getGroq();

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Create a detailed monthly planting calendar for ${seedType} in ${location}.
IMPORTANT: Write ALL activity descriptions in ${lang} language only. Do not use English unless ${lang} is English.
Respond in JSON format only (no markdown, no extra text):
{
  "seedType": "${seedType}",
  "location": "${location}",
  "calendar": {
    "January": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "February": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "March": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "April": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "May": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "June": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "July": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "August": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "September": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "October": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "November": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"},
    "December": {"activity": "activity description in ${lang}", "status": "ideal/possible/avoid/harvest"}
  },
  "summary": "Brief summary of the growing season in ${lang}"
}`,
        },
      ],
      max_tokens: 1500,
    });

    const responseText = response.choices[0]?.message?.content || '';
    let calendarData;

    try {
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      calendarData = JSON.parse(cleanedText);
    } catch {
      calendarData = { summary: responseText, seedType, location };
    }

    res.json({ success: true, data: calendarData });
  } catch (error) {
    console.error('Planting calendar error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

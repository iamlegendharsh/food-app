const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get advice section
router.post('/advice', auth, async (req, res) => {
  try {
    const { totalCalories, protein, carbs, fats, goal, calorieGoal } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_completion_tokens: 300,
      messages: [
        {
          role: 'system',
          content: 'You are a fitness nutrition assistant. Be practical, short, and helpful.'
        },
        {
          role: 'user',
          content: `
My fitness nutrition today:
- Calories: ${totalCalories} / ${calorieGoal} kcal
- Protein: ${protein}g
- Carbs: ${carbs}g
- Fats: ${fats}g
- Goal: ${goal}

Give me exactly 3 short bullet-point tips for the rest of my day.
          `
        }
      ]
    });

    res.json({ advice: completion.choices[0].message.content });
  } catch (err) {
    console.error('GROQ ADVICE ERROR:', err.message);
    res.status(500).json({ msg: err.message });
  }
});

// Food scan section
router.post('/scan-food', auth, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ msg: 'No image data received' });
    }

    const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.2,
      max_completion_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a food analysis assistant. Identify the food and estimate calories and macros carefully. Return only valid JSON.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this food image and return ONLY valid JSON in this exact structure:
{
  "foodName": "name",
  "estimatedWeight": "150g",
  "calories": 300,
  "protein": 20,
  "carbs": 30,
  "fats": 10,
  "confidence": "high",
  "tips": "one short tip"
}

If no food is visible, return:
{"error":"No food detected"}`
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ]
    });

    const text = completion.choices[0].message.content?.trim();
    const foodData = JSON.parse(text);

    if (foodData.error) {
      return res.status(400).json({ msg: foodData.error });
    }

    res.json({
      foodName: foodData.foodName || 'Unknown food',
      estimatedWeight: foodData.estimatedWeight || '1 serving',
      calories: Number(foodData.calories) || 0,
      protein: Number(foodData.protein) || 0,
      carbs: Number(foodData.carbs) || 0,
      fats: Number(foodData.fats) || 0,
      confidence: foodData.confidence || 'medium',
      tips: foodData.tips || 'Estimate only; verify for accuracy.'
    });
  } catch (err) {
    console.error('GROQ SCAN ERROR:', err.message);
    res.status(500).json({ msg: err.message });
  }
});

// Test route
router.get('/test-groq', async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_completion_tokens: 20,
      messages: [{ role: 'user', content: 'Reply with OK only' }]
    });

    res.json({
      ok: true,
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    console.error('TEST GROQ ERROR:', err.message);
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;

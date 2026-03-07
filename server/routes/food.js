const express = require('express');
const axios   = require('axios');
const router  = express.Router();

router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: {
        api_key:  process.env.USDA_API_KEY,
        query:    query,
        pageSize: 10
      }
    });

    const foods = response.data.foods.map(food => ({
      fdcId:    food.fdcId,
      name:     food.description,
      brand:    food.brandOwner || 'Generic',
      calories: food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 0,
      protein:  food.foodNutrients.find(n => n.nutrientName === 'Protein')?.value || 0,
      carbs:    food.foodNutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0,
      fats:     food.foodNutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0,
      unit: '100g'
    }));

    res.json(foods);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;

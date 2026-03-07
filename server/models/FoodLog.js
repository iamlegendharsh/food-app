const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date:     { type: String, required: true },
  mealType: { type: String, enum: ['breakfast','lunch','dinner','snack'] },
  foodName: String,
  calories: Number,
  protein:  Number,
  carbs:    Number,
  fats:     Number,
  quantity: Number,
  unit:     String
}, { timestamps: true });

module.exports = mongoose.model('FoodLog', FoodLogSchema);

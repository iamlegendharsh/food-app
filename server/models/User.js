const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:     String,
  email:    { type: String, unique: true },
  password: String,
  age:      Number,
  weight:   Number,
  height:   Number,
  goalWeight:        Number,
  dailyCalorieGoal:  { type: Number, default: 2000 },
  macroGoals: {
    protein: { type: Number, default: 150 },
    carbs:   { type: Number, default: 250 },
    fats:    { type: Number, default: 65 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

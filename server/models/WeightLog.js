const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  weight: Number,
  date:   { type: String, required: true }
});

module.exports = mongoose.model('WeightLog', WeightLogSchema);

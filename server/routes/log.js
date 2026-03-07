const express    = require('express');
const FoodLog    = require('../models/FoodLog');
const WeightLog  = require('../models/WeightLog');
const auth       = require('../middleware/auth');
const router     = express.Router();

router.post('/food', auth, async (req, res) => {
  try {
    const log = await FoodLog.create({ userId: req.user.id, ...req.body });
    res.json(log);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.get('/food/:date', auth, async (req, res) => {
  try {
    const logs = await FoodLog.find({ userId: req.user.id, date: req.params.date });
    res.json(logs);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.delete('/food/:id', auth, async (req, res) => {
  try {
    await FoodLog.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.post('/weight', auth, async (req, res) => {
  try {
    const log = await WeightLog.create({ userId: req.user.id, ...req.body });
    res.json(log);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.get('/weight', auth, async (req, res) => {
  try {
    const logs = await WeightLog.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;

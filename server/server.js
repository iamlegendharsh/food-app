const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('🔑 GEMINI KEY loaded:', process.env.GEMINI_API_KEY ? '✅ YES' : '❌ MISSING');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
  'https://food-app-b5xm.vercel.app/login',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/food', require('./routes/food'));
app.use('/api/log', require('./routes/log'));
app.use('/api/ai', require('./routes/ai'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

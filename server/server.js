const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
require('dotenv').config();
console.log('GEMINI KEY loaded:', process.env.GEMINI_API_KEY ? '✅ YES' : '❌ MISSING');
require('dotenv').config();
console.log('🔑 GEMINI KEY:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ MISSING');



const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://food-app-s81m.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(cors());
app.use(express.json());

app.use('/api/auth',  require('./routes/auth'));
app.use('/api/food',  require('./routes/food'));
app.use('/api/log',   require('./routes/log'));
app.use('/api/ai',    require('./routes/ai'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log(err));

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});

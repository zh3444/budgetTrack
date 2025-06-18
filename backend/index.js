/* eslint-disable no-undef */
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('hello from backend');
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

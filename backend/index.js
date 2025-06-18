import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import populateRoute from './routes/populate.js';

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://budget-track-livid.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use('/populate', populateRoute);


app.get('/', (req, res) => {
  res.send('hello from backend');
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Placeholder for POST /populate route
// app.post('/populate', async (req, res) => {
//   try {
//     const result = await ...
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

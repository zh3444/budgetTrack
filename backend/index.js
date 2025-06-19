import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoute from './routes/auth.js';

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://budget-track-livid.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use('/auth', authRoute);


app.get('/', (req, res) => {
  res.send('hello from backend');
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

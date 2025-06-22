import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';

import authRoute from './routes/auth.js';
import googleRoute from './routes/gmail.js';
import './gmail/auth.js';

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://budget-track-livid.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // secure: process.env.NODE_ENV === 'production', NEEDS TO BE TRUE IN PROD
    secure: true,
    sameSite: 'none', // needs to be set to none in prod
    httpOnly: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoute);
app.use('/gmail', googleRoute);


app.get('/', (req, res) => {
  res.send('hello from backend');
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

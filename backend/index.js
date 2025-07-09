import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';

import authRoute from './routes/auth.js';
import googleRoute from './routes/gmail.js';
import transactionRoute from './routes/transactions.js';
import './gmail/passport.js';

dotenv.config({ path: '../.env' });

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: ['http://localhost:5173', 'https://budget-track-livid.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
  },
  proxy: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoute);
app.use('/gmail', googleRoute);
app.use('/transactions', transactionRoute);

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

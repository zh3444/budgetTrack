/* eslint-disable no-undef */
import express from 'express';
import { processEmails } from './processEmails.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const app = express();
dotenv.config({ path: '../.env' });

app.post('/run', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
    }
    console.log('mongodb connected');
    await processEmails();
    res.status(200).send('Email parsing done');
  } catch (err) {
    console.error('Error running fetchEmails: ', err);
    res.status(500).send('Error running job');
  }
});

app.listen(8080, () => {
  console.log('Worker listening on port 8080');
});


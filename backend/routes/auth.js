import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config({ path: '../../.env' });
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// for authenticating a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ name: username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '100h'});
  res.json({ token });
});

// for registering a new user
router.post('/register', async (req, res) => {
  const { name, email, password, date } = req.body;
  console.log('print request body ', req.body);
  try {
    const result = await User.create({
      name,
      email,
      password,
      createdAt: date
    });
    res.status(200).json({
      message: 'User created successfully',
      data: result
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});


export default router;
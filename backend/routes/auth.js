/* eslint-disable no-undef */
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config({ path: '../../.env' });
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate a token from the request header.
 * 
 * This function checks for an authorization token in the request header.
 * If no token is found, it returns a 401 status with a 'Missing token' message.
 * If a token is found, it verifies the token using the JWT secret.
 * Upon successful verification, it attaches the decoded token to the request object.
 * If the token verification fails, it returns a 403 status with an 'Invalid or expired token' message.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * 
 * @returns {void}
 */

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token ', err});
  }
}

// for checking if the user needs to reauthenticate with Google
router.get('/check-gmail-token', authenticateToken, async (req, res) => {
  try {
    const user = await User.find({ email: req.user.email });

    if (!user) {
      return res.status(404).json({
        error: `User ${req.user.email} not found`
      });
    }
    if (user.gmailRefreshToken === 'error') {
      return res.json({
        valid: false,
        needsReauth: true
      });
    }
    return res.json({
      valid: true,
      needsReauth: false
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Token validation failed ' + error.message
    });
  }
});

// for authenticating a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      message: 'Invalid email or password',
      status: 401
    });
  }

  const token = jwt.sign({ userId: user._id, username: user.name }, JWT_SECRET, { expiresIn: '100h'});
  res.json({ token, username: user.name, status: 200 });
});

// for registering a new user
router.post('/register', async (req, res) => {
  const { name, email, password, date } = req.body;
  // hashing the input password
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await User.create({
      name,
      email,
      password: hashedPassword,
      createdAt: date,
      gmailRefreshToken: null,
      lastEmailCheck: null
    });
    res.status(200).json({
      message: 'User created successfully',
      status: 200
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

export default router;
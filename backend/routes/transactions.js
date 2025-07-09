import express from 'express';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/applepay', async (req, res) => {
  try {
    console.log('Received Apple Pay transaction request: ', req.body, req.body.data);
    const { email, password } = req.body;
    const { amount, merchant, date, category } = req.body.data;

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const transaction = new Transaction({
      userId: user._id,
      amount,
      merchant,
      date,
      category
    });
    const saved = await transaction.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
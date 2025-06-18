import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const result = await User.create({
      name: 'zh',
      email: 'zhihaoteo34@gmail.com'
    });
    res.status(200).json({
      message: 'User created successfully',
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

router.options('/', (req, res) => {
  res.sendStatus(204);
});

export default router;

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  gmailRefreshToken: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  accessToken: String,
  lastEmailCheck: {
    type: Date,
    default: null
  }
});

export const User = mongoose.model('User', userSchema);

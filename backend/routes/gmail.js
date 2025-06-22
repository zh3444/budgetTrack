import express from "express";
import passport from "passport";
import { google } from "googleapis";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config({ path: '../../.env' });

router.get('/google', passport.authenticate('google'));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log('Google OAuth callback route hit ', req.session.accessToken, req.session.user);
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);

router.get('/emails', async (req, res) => {
  const accessToken = req.session.accessToken;
  console.log('print get email request body ', req.session.accessToken);
  if (!accessToken) {
    return res.status(401).send("Not authorized with Gmail");
  }
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const response = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });

  res.json(response.data);
});

export default router;
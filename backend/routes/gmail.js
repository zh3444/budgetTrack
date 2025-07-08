import express from "express";
import passport from "passport";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config({ path: '../../.env' });

router.get('/google', (req, res, next) => {
  // verify and decode state
  let state = {};
  try {
    state = JSON.parse(decodeURIComponent(req.query.state));
    if (state.nonce) {
      req.session.nonce = state.nonce;
    } else {
      return res.status(400).json({
        error: 'Missing nonce',
        message: 'State must contain a nonce'
      });
    }
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid state parameter',
      message: 'State parameter is not valid JSON or is missing email',
      details: err
    })
  }

  passport.authenticate('google', {
    state: req.query.state,
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: '/login',
    acccessType: 'offline',
    prompt: 'consent',
    session: true
  }, async (err, user, info) => {
    try {
      // verify that state was maintained
      const state = JSON.parse(decodeURIComponent(req.query.state));
      console.log('state received ', state, user);
      if (!state.email) {
        throw new Error('Missing email verification');
      }
      const sessionNonce = req.session.nonce;
      if (!state.nonce || !sessionNonce || state.nonce !== sessionNonce) {
        return res.status(403).json({
          error: 'Invalid or missing nonce'
        });
      }

      delete req.session.nonce;
      // store tokens in session
      req.session.user = user.profile;
      req.session.accessToken = user.tokens.accessToken;
      req.session.refreshToken = user.tokens.refreshToken;
      req.session.expiry = user.tokens.expiry;

      await new Promise((resolve, reject) => {
        req.session.save(err => {
          if (err) reject(err);
          console.log('session saved with tokens: ', req.session.accessToken);
          resolve();
        });
      });

      res.redirect(`${process.env.FRONTEND_URL}/home`);
    } catch (error) {
      console.error('Error saving session: ', error);
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  })(req, res, next);
});

export default router;
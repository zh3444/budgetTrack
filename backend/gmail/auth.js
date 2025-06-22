/* eslint-disable no-undef */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config({ path: '../../.env' });

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
  passReqToCallback: true // Allows access to the request object
}, async (req, accessToken, refreshToken, profile, cb) => {
  try {
    if (!profile || !accessToken) {
      throw new Error("Google authentication failed - missing profile or token");
    }
    // TODO: save user to DB here
    console.log('print auth.js access token ', accessToken);
    req.session.user = profile;
    req.session.accessToken = accessToken;

    req.session.save((err) => {
      if (err) return cb(err);
      console.log('saving access token');
      cb(null, { profile, accessToken, refreshToken });
    });
  } catch (error) {
    console.error("Google authentication error: ", error);
    cb(error, null);
  }
}));

passport.serializeUser((user, done) => {
  try {
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
passport.deserializeUser((obj, done) => {
  try {
    done(null, obj);
  } catch (error) {
    done(error, null);
  }
});
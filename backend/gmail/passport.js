/* eslint-disable no-undef */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config({ path: '../../.env' });

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
  passReqToCallback: true, // Allows access to the request object
}, async (req, accessToken, refreshToken, profile, cb) => {
  try {
    if (!profile || !accessToken) {
      throw new Error("Google authentication failed - missing profile or token");
    }

    const rawState = req.query.state || '{}';
    const state = JSON.parse(decodeURIComponent(rawState));

    // case 1: user registered email is the same as the one used for Google login
    let existingUser = await User.findOne({ email: profile.emails[0].value });
    if (existingUser) {
      existingUser.gmailRefreshToken = refreshToken;
      await existingUser.save();
      console.log('User already exists, updating tokens: ', existingUser);

      const user = {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        gmailRefreshToken: existingUser.gmailRefreshToken,
        profile: {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiry: Date.now() + 3600 * 1000
        }
      }
      return cb(null, user);
    } else {
      // case 2: user registered email is different from the one used for Google login
      existingUser = await User.findOne({ email: state.email });
      if (existingUser) {
        existingUser.gmailRefreshToken = refreshToken;
        await existingUser.save();
        console.log('User found with original email, updating tokens: ', existingUser);
        const user = {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          gmailRefreshToken: existingUser.gmailRefreshToken,
          profile: {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
          },
          tokens: {
            accessToken,
            refreshToken,
            expiry: Date.now() + 3600 * 1000
          }
        }
        return cb(null, user);
      } else {
        // case 3: user cannot be found, return error
        console.log('No user found with the original email, returning error');
        return cb(new Error("No user found with the original email"), null);
      }
    }
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

passport.deserializeUser((user, done) => {
  try {
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
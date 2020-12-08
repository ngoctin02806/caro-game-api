require('dotenv').config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-token').Strategy;
const FacebookStrategy = require('passport-facebook-token');

passport.use(
  'google-token',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_APP_CLIENT_ID,
      clientSecret: process.env.GOOGLE_APP_CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.use(
  'facebook-token',
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_APP_CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

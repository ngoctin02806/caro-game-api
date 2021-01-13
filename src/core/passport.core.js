require('dotenv').config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-token').Strategy;
const FacebookStrategy = require('passport-facebook-token');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

passport.use(
  'login-local',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    (username, password, done) => {
      return done(null, { email: username, password });
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      algorithms: 'RS256',
      secretOrKey: process.env.JWT_PUBLIC_KEY,
      jwtFromRequest: ExtractJwt.fromHeader('x-auth-token'),
    },
    // eslint-disable-next-line camelcase
    (jwt_payload, done) => {
      return done(null, jwt_payload);
    }
  )
);

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

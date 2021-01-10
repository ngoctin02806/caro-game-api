const express = require('express');
const passport = require('passport');

const router = express.Router();
const userController = require('../app/controller/user.controller');

const validator = require('../utils/validator');
const schema = require('../schema');

router.post(
  '/me/login',
  passport.authenticate('login-local', { session: false }),
  validator(schema.login),
  userController.login
);

router.post(
  '/me/register',
  validator(schema.register),
  userController.register
);

router.post(
  '/me/account/activate',
  validator(schema.activeCode),
  passport.authenticate('jwt', { session: false }),
  userController.activateAccount
);

router.post(
  '/me/verified-code/send',
  passport.authenticate('jwt', { session: false }),
  userController.getVerifiedCode
);

router.post(
  '/user/account/password/forget',
  validator(schema.changePasswordThroughEmail),
  userController.sendMailToChangePassword
);

router.post(
  '/me/google/login',
  passport.authenticate('google-token', { session: false }),
  userController.googleLogin
);

router.post(
  '/me/facebook/login',
  passport.authenticate('facebook-token', {
    session: false,
    scope: ['email', 'profile'],
  }),
  userController.facebookLogin
);

router.get(
  '/me/user-online',
  passport.authenticate('jwt', { session: false }),
  userController.getOnlineFriends
);

router.get(
  '/me/profile',
  passport.authenticate('jwt', { session: false }),
  userController.getProfile
);

router.post(
  '/users/coins/giveaway',
  passport.authenticate('jwt', { session: false }),
  userController.giveaway
);

router.get(
  '/users/:userId/profile',
  passport.authenticate('jwt', { session: false }),
  userController.getUserProfile
);

router.post(
  '/user/account/password/reset',
  passport.authenticate('jwt', { session: false }),
  validator(schema.renewPassword),
  userController.changePassword
);

module.exports = router;

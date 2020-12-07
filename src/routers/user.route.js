const express = require('express');

const router = express.Router();
const userController = require('../app/controller/user.controller');

const validator = require('../utils/validator');
const authMiddleware = require('../middlewares/auth.middleware');
const validateEmailMiddleware = require('../middlewares/validateEmail.middleware'); // eslint-disable-line
const schema = require('../schema');

router.post('/me/login', validator(schema.login), userController.login);
router.post(
  '/me/register',
  validator(schema.register),
  userController.register
);
router.post(
  '/me/account/activate',
  validator(schema.activeCode),
  authMiddleware,
  userController.activateAccount
);
router.post(
  '/me/verified-code/send',
  authMiddleware,
  userController.getVerifiedCode
);
router.post(
  '/me/account/password/reset',
  validator(schema.changePasswordThroughEmail),
  userController.sendMailToChangePassword
);

module.exports = router;

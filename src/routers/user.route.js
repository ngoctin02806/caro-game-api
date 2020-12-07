const express = require('express');

const router = express.Router();
const userController = require('../app/controller/user.controller');

const validator = require('../utils/validator');
const schema = require('../schema');

router.post('/me/login', validator(schema.login), userController.login);
router.post(
  '/me/register',
  validator(schema.register),
  userController.register
);

module.exports = router;

const express = require('express');
const passport = require('passport');

const router = express.Router();

const validator = require('../utils/validator');
const schema = require('../schema');

const paymentController = require('../app/controller/payment.controller');
const httpErrorsHelper = require('../lib/httpErrorsHelper');

router.post(
  '/payments/momo/transactions/webhook',
  paymentController.momoWebhook
);

router.post(
  '/payments/transactions',
  passport.authenticate('jwt', {
    session: false,
    failWithError: httpErrorsHelper.unauthorized(),
  }),
  validator(schema.transaction),
  paymentController.generateTransaction
);

router.get(
  '/payments/vnpay/transactions/webhook',
  paymentController.vnpayWebhook
);

router.get(
  '/payments/transactions',
  passport.authenticate('jwt', {
    session: false,
    failWithError: httpErrorsHelper.unauthorized(),
  }),
  paymentController.getAllTransactions
);

router.get(
  '/payments/transactions/:transactionId/histories',
  passport.authenticate('jwt', {
    session: false,
    failWithError: httpErrorsHelper.unauthorized(),
  }),
  paymentController.getAllTransactionHistories
);

module.exports = router;

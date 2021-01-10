const express = require('express');

const router = express.Router();

const validator = require('../utils/validator');
const schema = require('../schema');

const paymentController = require('../app/controller/payment.controller');

router.post(
  '/payments/transactions',
  validator(schema.transaction),
  paymentController.generateTransaction
);

router.get(
  '/payments/vnpay/transactions/webhook',
  paymentController.vnpayWebhook
);

router.get('/payments/transactions', paymentController.getAllTransactions);

router.get(
  '/payments/transactions/:transactionId/histories',
  paymentController.getAllTransactionHistories
);

module.exports = router;

const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const validator = require('../utils/validator');
const schema = require('../schema');

const paymentController = require('../app/controller/payment.controller');

router.post(
  '/payments/transactions',
  authMiddleware,
  validator(schema.transaction),
  paymentController.generateTransaction
);

router.get(
  '/payments/vnpay/transactions/webhook',
  paymentController.vnpayWebhook
);

router.get(
  '/payments/transactions',
  authMiddleware,
  paymentController.getAllTransactions
);

router.get(
  '/payments/transactions/:transactionId/histories',
  authMiddleware,
  paymentController.getAllTransactionHistories
);

module.exports = router;

const express = require('express');

const router = express.Router();

const adminStatsController = require('../app/controller/adminStats.controller');
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');

router.get(
  '/admin-stats/transactions/sale-amount-by-day',
  adminAuthMiddleware,
  adminStatsController.countSaleAmountByDay
);

// Insert data:
router.get(
  '/admin-stats/insert-data/transactionhistories',
  adminAuthMiddleware,
  adminStatsController.insertTransactionHistories
);

module.exports = router;

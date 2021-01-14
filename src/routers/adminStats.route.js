const express = require('express');
const passport = require('passport');

const router = express.Router();

const adminStatsController = require('../app/controller/adminStats.controller');

router.get(
  '/admin-stats/transactions/sale-amount-by-day',
  passport.authenticate('jwt', { session: false }),
  adminStatsController.countSaleAmountByDay
);

router.get(
  '/admin-stats/transactions/sale-amount-by-week',
  passport.authenticate('jwt', { session: false }),
  adminStatsController.countSaleAmountByWeek
);

router.get(
  '/admin-stats/transactions/sale-amount-by-month',
  passport.authenticate('jwt', { session: false }),
  adminStatsController.countSaleAmountByMonth
);

router.get(
  '/admin-stats/transactions/sale-amount-by-year',
  passport.authenticate('jwt', { session: false }),
  adminStatsController.countSaleAmountByYear
);

// Insert data:
router.get(
  '/admin-stats/insert-data/transactionhistories',
  adminStatsController.insertTransactionHistories
);

module.exports = router;

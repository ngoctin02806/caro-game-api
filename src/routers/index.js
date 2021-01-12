const express = require('express');
const passport = require('passport');

const router = express.Router();
const userRouter = require('./user.route');
const conversationRouter = require('./conversation.route');
const roomRouter = require('./room.route');
const gameRouter = require('./game.route');
const statisticRouter = require('./statistic.route');
const paymentRouter = require('./payment.route');
const httpErrorsHelper = require('../lib/httpErrorsHelper');

router.use('/', userRouter);

router.use('/', paymentRouter);

router.use(
  passport.authenticate('jwt', {
    session: false,
    failWithError: httpErrorsHelper.unauthorized(),
  })
); // Secure api

router.use('/', conversationRouter);
router.use('/', roomRouter);
router.use('/', gameRouter);
router.use('/', statisticRouter);

module.exports = router;

const express = require('express');

const router = express.Router();
const userRouter = require('./user.route');
const conversationRouter = require('./conversation.route');
const roomRouter = require('./room.route');
const gameRouter = require('./game.route');

router.use('/', userRouter);
router.use('/', conversationRouter);
router.use('/', roomRouter);
router.use('/', gameRouter);

module.exports = router;

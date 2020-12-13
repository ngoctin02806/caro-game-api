const express = require('express');

const router = express.Router();
const userRouter = require('./user.route');
const conversationRouter = require('./conversation.route');

router.use('/', userRouter);
router.use('/', conversationRouter);

module.exports = router;

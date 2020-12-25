const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const statisticCtl = require('../app/controller/statistic.controller');

const router = express.Router();

router.get('/statistic/rankings', authMiddleware, statisticCtl.getRanking);

module.exports = router;

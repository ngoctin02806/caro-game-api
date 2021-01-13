const express = require('express');

const statisticCtl = require('../app/controller/statistic.controller');

const router = express.Router();

router.get('/statistic/rankings', statisticCtl.getRanking);

module.exports = router;

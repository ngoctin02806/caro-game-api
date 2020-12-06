const express = require('express');

const router = express.Router();
const controller = require('./controller/attribute.controller');

router.get('/get_attributes', controller.getAttribute);

module.exports = router;

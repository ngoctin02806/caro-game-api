const express = require('express');

const router = express.Router();

const roomController = require('../app/controller/room.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/room/create', authMiddleware, roomController.createRoom);

module.exports = router;

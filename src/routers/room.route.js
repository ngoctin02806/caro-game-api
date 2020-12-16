const express = require('express');

const router = express.Router();

const roomController = require('../app/controller/room.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/room/create', authMiddleware, roomController.createRoom);

router.post('/room/join/:roomId', authMiddleware, roomController.joinRoom);

router.get('/room/get-all', authMiddleware, roomController.getAllRooms);

router.get('/room/:roomId', authMiddleware, roomController.getRoom);

module.exports = router;

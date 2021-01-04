const express = require('express');

const router = express.Router();

const roomController = require('../app/controller/room.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validator = require('../utils/validator');
const schema = require('../schema');

router.post(
  '/rooms',
  authMiddleware,
  validator(schema.createARoom),
  roomController.createRoom
);

router.post(
  '/rooms/:roomId/join',
  authMiddleware,
  validator(schema.roomSecret),
  roomController.joinRoom
);

router.post('/rooms/:roomId/leave', authMiddleware, roomController.leaveRoom);

router.get('/rooms', authMiddleware, roomController.getAllRooms);

router.get('/rooms/:roomId', authMiddleware, roomController.getRoom);

router.get('/room/emptiness', authMiddleware, roomController.findEmptyRoom);

module.exports = router;

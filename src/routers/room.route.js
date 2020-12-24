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

router.post('/room/join/:roomId', authMiddleware, roomController.joinRoom);

router.get('/room/get-all', authMiddleware, roomController.getAllRooms);

router.get('/rooms/:roomId', authMiddleware, roomController.getRoom);

module.exports = router;

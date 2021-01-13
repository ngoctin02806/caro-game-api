const express = require('express');

const router = express.Router();

const roomController = require('../app/controller/room.controller');
const validator = require('../utils/validator');
const schema = require('../schema');

router.post('/rooms', validator(schema.createARoom), roomController.createRoom);

router.post(
  '/rooms/:roomId/join',
  validator(schema.roomSecret),
  roomController.joinRoom
);

router.post('/rooms/:roomId/leave', roomController.leaveRoom);

router.get('/rooms', roomController.getAllRooms);

router.get('/rooms/:roomId', roomController.getRoom);

router.get('/room/emptiness', roomController.findEmptyRoom);

module.exports = router;

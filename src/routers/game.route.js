const express = require('express');

const router = express.Router();

const gameController = require('../app/controller/game.controller');

const validator = require('../utils/validator');
const schema = require('../schema');

router.post(
  '/rooms/:roomId/games',
  validator(schema.createAGame),
  gameController.createGame
);

router.post('/game/update-winner/:gameId', gameController.updateGameWinner);

router.post(
  '/rooms/:roomId/games/:gameId/coins/charge',
  validator(schema.point),
  gameController.computePointForUser
);

router.get('/games/:gameId', gameController.getGameById);

module.exports = router;

const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const gameController = require('../app/controller/game.controller');

const validator = require('../utils/validator');
const schema = require('../schema');

router.post(
  '/rooms/:roomId/games',
  authMiddleware,
  validator(schema.createAGame),
  gameController.createGame
);

router.post(
  '/game/update-winner/:gameId',
  authMiddleware,
  gameController.updateGameWinner
);

module.exports = router;

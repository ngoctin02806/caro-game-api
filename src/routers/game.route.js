const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const gameController = require('../app/controller/game.controller');

router.post('/game/create/:roomId', authMiddleware, gameController.createGame);

router.post(
  '/game/update-winner/:gameId',
  authMiddleware,
  gameController.updateGameWinner
);

module.exports = router;

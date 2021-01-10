const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const gameController = require('../app/controller/game.controller');

router.post('/game/create/:roomId', authMiddleware, gameController.createGame);

router.post(
  '/game/update-winner/:gameId',
  authMiddleware,
  gameController.updateGameWinner
);

router.get('/game/get-all', adminAuthMiddleware, gameController.getAll);

module.exports = router;

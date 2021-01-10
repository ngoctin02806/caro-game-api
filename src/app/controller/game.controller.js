const generateSafeId = require('generate-safe-id');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');

const gameService = require('../services/game1.service');
const roomService = require('../services/game.service');

module.exports.createGame = async (req, res, next) => {
  try {
    const userId = req.user._id; // eslint-disable-line
    const { roomId } = req.params;

    const findRoom = await roomService.findOneGame({ _id: roomId });
    if (findRoom.value instanceof Error) throw findRoom.value;
    if (!findRoom.value)
      return res.status(400).json(httpErrorsHelper.gameNotExist());

    const newGame = {
      _id: generateSafeId(),
      created_by: userId,
      winner: '',
      room_id: roomId,
      steps: new Array(0),
      created_at: new Date().getTime(),
    };

    const result = await gameService.insertOne(newGame);
    if (result.value instanceof Error) throw result.value;

    return res.status(201).json({
      ...result.value,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.updateGameWinner = async (req, res, next) => {
  const { winner } = req.body;
  const { gameId } = req.params;
  try {
    const result = await gameService.updateGameWinner(gameId, winner);
    if (result.value instanceof Error) throw result.value;

    return res.status(200).json({
      data: {
        ...result.value,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.getAll = async (req, res, next) => {
  try {
    const games = await gameService.findAll();

    if (games.value instanceof Error) throw games.value;

    return res.status(200).json({ data: games.value });
  } catch (error) {
    return next(error);
  }
};

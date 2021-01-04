const generateSafeId = require('generate-safe-id');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');

const gameService = require('../services/game1.service');
const roomService = require('../services/game.service');
const userSrv = require('../services/user.service');

module.exports.createGame = async (req, res, next) => {
  try {
    const userId = req.user._id; // eslint-disable-line
    const { roomId } = req.params;
    const { players } = req.body;

    const findRoom = await roomService.findOneGame({ _id: roomId });

    if (findRoom.value instanceof Error) throw findRoom.value;

    if (!findRoom.value)
      return res.status(400).json(httpErrorsHelper.gameNotExist());

    const users = await userSrv.aggregate([
      {
        $match: {
          _id: { $in: players },
        },
      },
    ]);

    if (users.value instanceof Error) throw users.value;

    if (users.value.length !== players.length)
      return res.status(400).json(httpErrorsHelper.userNotExist());

    const newGame = {
      _id: generateSafeId(),
      created_by: userId,
      room_id: roomId,
      steps: [],
      players,
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

module.exports.computePointForUser = async (req, res, next) => {
  try {
    const { roomId, gameId } = req.params;
    const { _id: userId } = req.user;
    const { point } = req.body;

    const room = await roomService.findOneGame({ _id: roomId });

    if (room.value instanceof Error) throw room.value;

    if (!room.value)
      return res.status(400).json(httpErrorsHelper.roomNotExist());

    const game = await gameService.findOne(gameId);

    if (game.value instanceof Error) throw game.value;

    if (!game.value)
      return res.status(400).json(httpErrorsHelper.gameNotExist());

    if (game.value.room_id !== roomId)
      return res.status(400).json(httpErrorsHelper.gameNotBelongToRoom());

    const result = userSrv.computePointUser({ roomId, gameId, userId, point });

    if (result.value instanceof Error) throw result.value;

    return res.status(200).json({ message: 'success' });
  } catch (error) {
    return next(error);
  }
};

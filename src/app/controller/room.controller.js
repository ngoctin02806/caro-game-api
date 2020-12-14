const generateSafeId = require('generate-safe-id');

const roomService = require('../services/game.service');

module.exports.createRoom = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const newRoom = {
      _id: generateSafeId(),
      players: new Array({ player_id: _id }),
      guests: new Array(0),
    };

    const result = await roomService.insertOne(newRoom);
    if (result.value instanceof Error) throw result.value;

    return res.status(201).json({
      ...result.value,
    });
  } catch (err) {
    return next(err);
  }
};

const generateSafeId = require('generate-safe-id');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');

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

module.exports.joinRoom = async (req, res, next) => {
  try {
    const userId = req.user._id; // eslint-disable-line
    const { roomId } = req.params;
    const findRoom = await roomService.findOneGame({ _id: roomId });

    if (findRoom.value instanceof Error) throw findRoom.value;

    if (!findRoom.value)
      return res.status(400).json(httpErrorsHelper.gameNotExist());

    const currentRoom = findRoom.value;
    let userInRoomFlag = false;

    currentRoom.players.map(player => {
      if (player.player_id === userId) {
        userInRoomFlag = true;
        return res.status(400).json(httpErrorsHelper.userIsAlreadyInRoom());
      }
      return null;
    });

    currentRoom.guests.map(guest => {
      if (guest.guest_id === userId) {
        userInRoomFlag = true;
        return res.status(400).json(httpErrorsHelper.userIsAlreadyInRoom());
      }
      return null;
    });

    if (userInRoomFlag) return; // eslint-disable-line

    if (currentRoom.players.length < 2) {
      currentRoom.players.push({ player_id: userId });
      const result = await roomService.updateRoom(
        roomId,
        currentRoom.players,
        currentRoom.guests
      );
      if (result.value instanceof Error) throw result.value;

      return res.status(201).json({
        ...result.value,
      });
    }

    currentRoom.guests.push({ guest_id: userId });
    const result = await roomService.updateRoom(
      roomId,
      currentRoom.players,
      currentRoom.guests
    );
    if (result.value instanceof Error) throw result.value;

    return res.status(201).json({
      ...result.value,
    });
  } catch (err) {
    return next(err);
  }
};

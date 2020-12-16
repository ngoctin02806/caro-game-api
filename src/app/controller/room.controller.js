const generateSafeId = require('generate-safe-id');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');

const roomService = require('../services/game.service');
const conversationService = require('../services/conversation.service');

module.exports.createRoom = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const newRoom = {
      _id: generateSafeId(),
      players: new Array(_id),
      guests: new Array(0),
      created_by: _id,
      created_at: new Date().getTime(),
    };

    // create room
    const result = await roomService.insertOne(newRoom);
    if (result.value instanceof Error) throw result.value;

    // create conversation
    try {
      const resultInsertConversion = await conversationService.insertOne({
        _id: generateSafeId(),
        participants: new Array(_id),
        roomId: newRoom._id, // eslint-disable-line
        type: 'CONVERSATION_GAME',
        created_by: _id,
        created_at: new Date().getTime(),
      });

      if (resultInsertConversion.value instanceof Error) throw result.value;
    } catch (err) {
      return next(err);
    }

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
      if (player === userId) {
        userInRoomFlag = true;
        return res.status(400).json(httpErrorsHelper.userIsAlreadyInRoom());
      }
      return null;
    });

    currentRoom.guests.map(guest => {
      if (guest === userId) {
        userInRoomFlag = true;
        return res.status(400).json(httpErrorsHelper.userIsAlreadyInRoom());
      }
      return null;
    });

    if (userInRoomFlag) return; // eslint-disable-line

    if (currentRoom.players.length < 2) {
      currentRoom.players.push(userId);
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

    currentRoom.guests.push(userId);
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

module.exports.getAllRooms = async (req, res, next) => {
  try {
    const result = await roomService.getAllRooms();
    if (result.value instanceof Error) throw result.value;

    return res.status(201).json(result.value);
  } catch (err) {
    return next(err);
  }
};

module.exports.getRoom = async (req, res, next) => {
  const { roomId } = req.params;
  try {
    const result = await roomService.getRoom(roomId);
    if (result.value instanceof Error) throw result.value;
    return res.status(201).json(result.value);
  } catch (err) {
    return next(err);
  }
};

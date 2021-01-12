const generateSafeId = require('generate-safe-id');
const config = require('config');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');

const roomService = require('../services/game.service');
const conversationService = require('../services/conversation.service');
const userService = require('../services/user.service');
const { FULL_SLOT, HAS_JOINED } = require('../constants/room.constant');

module.exports.createRoom = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { room_name, type, room_secret, bet_level } = req.body; // eslint-disable-line

    // Get user
    const user = await userService.getUserById(_id);

    if (user.value instanceof Error) throw user.value;

    const pointLogs = await userService.computePoinLogsUser(_id);

    if (pointLogs.value instanceof Error) throw pointLogs.value;

    // eslint-disable-next-line camelcase
    if (pointLogs.value < bet_level)
      return res.status(400).json(httpErrorsHelper.notEnoughPoint());

    const newRoom = {
      _id: generateSafeId(),
      room_name,
      players: new Array(_id),
      guests: new Array(0),
      created_by: _id,
      created_at: new Date().getTime(),
      type,
      room_secret,
      bet_level,
    };

    // create room
    const result = await roomService.insertOne(newRoom);

    if (result.value instanceof Error) throw result.value;

    // create conversation
    try {
      const resultInsertConversion = await conversationService.insertOne({
        _id: generateSafeId(),
        participants: new Array(_id),
        room_id: newRoom._id, // eslint-disable-line
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
      players: [
        { _id, username: user.value.username, avatar: user.value.avatar },
      ],
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.joinRoom = async (req, res, next) => {
  try {
    const userId = req.user._id; // eslint-disable-line
    const { roomId } = req.params;

    // eslint-disable-next-line camelcase
    const { room_secret } = req.body;
    const room = await roomService.findOneGame({ _id: roomId });

    if (room.value instanceof Error) throw room.value;

    if (!room.value)
      return res.status(400).json(httpErrorsHelper.roomNotExist());

    const pointLogs = await userService.computePoinLogsUser(userId);

    if (pointLogs.value instanceof Error) throw pointLogs.value;

    if (pointLogs.value < room.value.bet_level)
      return res.status(400).json(httpErrorsHelper.notEnoughPoint());

    // eslint-disable-next-line camelcase
    if (room.value.room_secret !== room_secret)
      return res.status(400).json(httpErrorsHelper.roomSecretDoesNotMatch());

    if (room.value.players.length === 2)
      return res.status(200).json({ message: FULL_SLOT });

    const appendUser = await roomService.appendPlayerInRoom(
      roomId,
      userId,
      room.value.players
    );

    const appendUserInConver = await conversationService.appendUserInConversation(
      roomId,
      userId
    );

    if (appendUserInConver.value instanceof Error)
      throw appendUserInConver.value;

    if (appendUser.value instanceof Error) throw appendUser.value;

    return res.status(200).json({
      message: HAS_JOINED,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.leaveRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { _id: userId } = req.user;

    const room = await roomService.findOneGame({ _id: roomId });

    if (room.value instanceof Error) throw room.value;

    if (!room.value)
      return res.status(400).json(httpErrorsHelper.roomNotExist());

    const player = room.value.players.find(p => p === userId);

    if (!player)
      return res.status(400).json(httpErrorsHelper.userIsNotExistInRoom());

    const result = await roomService.removePlayerInRoom(roomId, userId);

    if (result.value instanceof Error) throw result.value;

    return res.status(200).json({ message: 'success' });
  } catch (error) {
    return next(error);
  }
};

module.exports.getAllRooms = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { offset = 1, limit = config.get('LIMIT') } = req.query;
  try {
    const result = await roomService.getAllRooms(userId, {
      offset: parseInt(offset), // eslint-disable-line
      limit: parseInt(limit), // eslint-disable-line
    });

    if (result.value instanceof Error) throw result.value;

    return res.status(200).json({
      total: result.value.count,
      offset,
      limit,
      rooms: result.value.rooms,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.getRoom = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    const result = await roomService.getRoom(roomId);
    if (result.value instanceof Error) throw result.value;
    return res.status(200).json(result.value);
  } catch (err) {
    return next(err);
  }
};

module.exports.findEmptyRoom = async (req, res, next) => {
  try {
    const room = await roomService.findEmptyRoom();

    if (room.value instanceof Error) throw room.value;

    return res.status(200).json({ ...room.value });
  } catch (error) {
    return next(error);
  }
};

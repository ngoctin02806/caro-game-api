const generateSafeId = require('generate-safe-id');
const config = require('config');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');

const {
  CONVERSATION_SINGLE,
  CONVERSATION_GAME,
} = require('../constants/conversation.constant');

const conversationService = require('../services/conversation.service');
const gameService = require('../services/game.service');
const roomService = require('../services/room.service');
const game1Service = require('../services/game1.service');

module.exports.createAConversation = async (req, res, next) => {
  try {
    const { participants, type } = req.body;
    const { _id } = req.user;

    const conversation = await conversationService.findOneConversation({
      $and: [
        { type: CONVERSATION_SINGLE },
        { participants: { $all: participants } },
      ],
    });

    if (conversation.value instanceof Error) throw conversation.value;

    if (!conversation.value) {
      const result = await conversationService.insertOne({
        _id: generateSafeId(),
        participants,
        type,
        created_by: _id,
        created_at: new Date().getTime(),
      });

      if (result.value instanceof Error) throw result.value;

      return res.status(201).json({
        ...result.value,
      });
    }

    return res.status(200).json({
      data: {
        ...conversation.value,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.createAGameConversation = async (req, res, next) => {
  try {
    const { gameId } = req.params;

    const game = await gameService.findOneGame({ _id: gameId });

    if (game.value instanceof Error) throw game.value;

    if (!game.value)
      return res.status(400).json(httpErrorsHelper.gameNotExist());

    const conversation = await conversationService.findOneConversation({
      $and: [{ room_id: game.value._id }, { type: CONVERSATION_GAME }], // eslint-disable-line
    });

    if (conversation.value instanceof Error) throw conversation.value;

    if (!conversation.value)
      return res.status(400).json(httpErrorsHelper.conversationNotExist());

    return res.status(200).json({
      data: {
        ...conversation.value,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.getConversationById = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await conversationService.findAConversationData(
      conversationId
    );

    if (conversation.value instanceof Error) throw conversation.value;

    if (!conversation.value)
      return res.status(400).json(httpErrorsHelper.notFound());

    return res.status(200).json({
      data: {
        ...conversation.value,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.getAllMessagesByConversationId = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const { offset = 1, limit = config.get('LIMIT') } = req.query;

    const conversation = await conversationService.findOneConversation({
      _id: conversationId,
    });

    if (conversation.value instanceof Error) throw conversation.value;

    if (!conversation.value)
      return res.status(400).json(httpErrorsHelper.conversationNotExist());

    const messages = await conversationService.findAllMessages({
      conversationId,
      offset: parseInt(offset), // eslint-disable-line
      limit: parseInt(limit), // eslint-disable-line
    });

    if (messages.value instanceof Error) throw messages.value;

    return res.status(200).json({
      messages: messages.value,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.getAllMessagesByGameId = async (req, res, next) => {
  const { gameId } = req.params;

  try {
    const game = await game1Service.findGameById(gameId);
    if (game instanceof Error) throw game.value;
    if (!game.value) return res.status(400).json(httpErrorsHelper.gameNotExist);

    const roomId = game.value.room_id;

    const room = await roomService.findRoomById(roomId);
    if (room instanceof Error) throw room.value;
    if (!room.value) {
      return res.status(400).json(httpErrorsHelper.roomIsNotExist());
    }

    const conversation = await conversationService.findOneConversation({
      room_id: roomId, //eslint-disable-line
    });
    if (conversation.value instanceof Error) throw conversation.value;
    if (!conversation.value)
      return res.status(400).json(httpErrorsHelper.conversationNotExist());

    const conversationId = conversation.value._id; // eslint-disable-line

    const messages = await conversationService.findAllMessagesByConversationId(
      conversationId
    );

    if (messages.value instanceof Error) throw messages.value;

    return res.status(200).json({
      messages: messages.value,
    });
  } catch (error) {
    return next(error);
  }
};

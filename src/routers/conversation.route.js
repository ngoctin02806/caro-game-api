const express = require('express');

const conversationController = require('../app/controller/conversation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const vaidator = require('../utils/validator');
const schema = require('../schema');

const router = express.Router();

router.post(
  '/conversations',
  authMiddleware,
  vaidator(schema.createAConversation),
  conversationController.createAConversation
);

router.get(
  '/games/:gameId/conversation',
  authMiddleware,
  conversationController.createAGameConversation
);

router.get(
  '/conversations/:conversationId',
  authMiddleware,
  conversationController.getConversationById
);

router.get(
  '/conversations/:conversationId/messages',
  authMiddleware,
  conversationController.getAllMessagesByConversationId
);

module.exports = router;

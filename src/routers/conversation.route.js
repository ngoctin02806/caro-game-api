const express = require('express');

const conversationController = require('../app/controller/conversation.controller');
const vaidator = require('../utils/validator');
const schema = require('../schema');

const router = express.Router();

router.post(
  '/conversations',
  vaidator(schema.createAConversation),
  conversationController.createAConversation
);

router.get(
  '/games/:gameId/conversation',
  conversationController.createAGameConversation
);

router.get(
  '/conversations/:conversationId',
  conversationController.getConversationById
);

router.get(
  '/conversations/:conversationId/messages',
  conversationController.getAllMessagesByConversationId
);

module.exports = router;

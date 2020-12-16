const Result = require('folktale/result');
const { get } = require('lodash');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'conversations';
const MSG_COLLECTION = 'messages';

const insertOne = async data => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const inserted = await collection.insertOne({ ...data });

    return Promise.resolve(Result.Ok(get(inserted, 'ops.0')));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findOneConversation = async payload => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.findOne({ ...payload });

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findAllConversations = async payload => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const results = await collection.find({ ...payload }).toArray();

    return Promise.resolve(Result.Ok(results));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findOneMessage = async ({ _id: id }) => {
  try {
    const db = mongo.db();
    const collection = db.collection(MSG_COLLECTION);

    const result = await collection.findOne({ _id: id });

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findAllMessages = async ({ conversationId, offset, limit }) => {
  try {
    const db = mongo.db();
    const collection = db.collection(MSG_COLLECTION);

    const results = await collection
      .aggregate([
        {
          $sort: {
            created_at: -1,
          },
        },
        {
          $match: {
            conversation_id: conversationId,
          },
        },
        {
          $skip: (offset - 1) * limit,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(results));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findConversationByParticipant = async ({ type, participants }) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const conversation = await collection.find({
      $and: [{ type }, { participants: { $all: participants } }],
    });

    return Promise.resolve(Result.Ok(conversation));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findAConversationData = async conversationId => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const conversation = await collection
      .aggregate([
        { $match: { _id: conversationId } },
        {
          $lookup: {
            from: 'users',
            localField: 'participants',
            foreignField: '_id',
            as: 'participants',
          },
        },
        {
          $project: {
            'participants.password': 0,
            'participants.role': 0,
            'participants.is_verified': 0,
            'participants.verified_code': 0,
          },
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(conversation[0]));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  insertOne,
  findOneConversation,
  findAllConversations,
  findOneMessage,
  findAllMessages,
  findConversationByParticipant,
  findAConversationData,
};

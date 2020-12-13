const Result = require('folktale/result');
const { get } = require('lodash');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'conversations';
const MSG_COLLECTION = 'messsages';

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

const findAllMessages = async () => {
  try {
    const db = mongo.db();
    const collection = db.collection(MSG_COLLECTION);

    const results = await collection.find().toArray();

    return Promise.resolve(Result.Ok(results));
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
};

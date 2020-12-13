const Result = require('folktale/result');
const { get } = require('lodash');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'rooms';

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

const findOneGame = async payload => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.findOne({ ...payload });

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  insertOne,
  findOneGame,
};

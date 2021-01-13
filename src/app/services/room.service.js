const Result = require('folktale/result');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'rooms';

const findRoomById = async roomId => {
  try {
    const collection = mongo.db().collection(COLLECTION);
    const room = await collection.findOne({ _id: roomId });

    return Promise.resolve(Result.Ok(room));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = { findRoomById };

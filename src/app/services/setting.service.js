const Result = require('folktale/result');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'settings';

const findOne = async key => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const setting = await collection.findOne({ key });

    return Promise.resolve(Result.Ok(setting));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  findOne,
};

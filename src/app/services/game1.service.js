const Result = require('folktale/result');
const { get } = require('lodash');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'games';

const findOne = async gameId => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const game = await collection.findOne({ _id: gameId });

    return Promise.resolve(Result.Ok(game));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

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

const updateGameWinner = async (gameId, winner) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.updateOne(
      { _id: gameId },
      { $set: { winner } }
    );

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findOneGameIncludeInforUser = async gameId => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const game = await collection
      .aggregate([
        {
          $match: {
            _id: gameId,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'players',
            foreignField: '_id',
            as: 'players',
          },
        },
        {
          $project: {
            'players.password': 0,
            'players.role': 0,
            'players.is_verified': 0,
            'players.verified_code': 0,
            'players.has_topup': 0,
            'players.provider': 0,
          },
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(game[0]));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  insertOne,
  updateGameWinner,
  findOne,
  findOneGameIncludeInforUser,
};

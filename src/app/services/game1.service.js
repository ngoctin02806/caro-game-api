const Result = require('folktale/result');
const { get } = require('lodash');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'games';

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

const findAll = async () => {
  const collection = mongo.db().collection(COLLECTION);

  try {
    const games = await collection
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by',
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
          $lookup: {
            from: 'users',
            localField: 'winner_id',
            foreignField: '_id',
            as: 'winner',
          },
        },
        {
          $project: {
            'created_by._id': 1,
            'created_by.username': 1,
            'players._id': 1,
            'players.username': 1,
            'winner._id': 1,
            'winner.username': 1,
            created_at: 1,
            steps: 1,
          },
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(games));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = { insertOne, updateGameWinner, findAll };

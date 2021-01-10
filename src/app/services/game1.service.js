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
        { $unwind: '$steps' },
        {
          $project: {
            'created_by._id': 1,
            'created_by.username': 1,
            'players._id': 1,
            'players.username': 1,
            'winner._id': 1,
            'winner.username': 1,
            created_at: 1,
            steps_count: {
              $size: {
                $filter: {
                  input: '$steps',
                  as: 'step',
                  cond: { $ne: ['$$step', null] },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: {
              _id: '$_id',
              created_by: '$created_by',
              players: '$players',
              winner: '$winner',
              created_at: '$created_at',
            },
            steps_count: { $sum: '$steps_count' },
          },
        },
      ])
      .toArray();

    const formattedData = [];
    games.map(
      data => formattedData.push({ ...data._id, steps_count: data.steps_count }) // eslint-disable-line
    );

    return Promise.resolve(Result.Ok(formattedData));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findGameById = async gameId => {
  const collection = mongo.db().collection(COLLECTION);
  try {
    const game = await collection
      .aggregate([{ $match: { _id: gameId } }])
      .toArray();

    return Promise.resolve(Result.Ok(game[0]));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = { insertOne, updateGameWinner, findAll, findGameById };

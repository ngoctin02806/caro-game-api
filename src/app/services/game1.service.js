const Result = require('folktale/result');
const { get } = require('lodash');
const config = require('config');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'games';
const MESSAGE_COLLECTION = 'messages';

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
        { $sort: { '_id.created_at': -1 } },
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

const findAllMessages = async (
  gameId,
  { offset = 1, limit = config.get('LIMIT') }
) => {
  try {
    const db = mongo.db();
    const messageCollection = db.collection(MESSAGE_COLLECTION);

    const messages = await messageCollection
      .aggregate([
        {
          $match: {
            game_id: gameId,
          },
        },
        {
          $sort: {
            created_at: -1,
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

    return Promise.resolve(Result.Ok({ offset, limit, messages }));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findByUserId = async userId => {
  const collection = mongo.db().collection(COLLECTION);

  try {
    const games = await collection
      .aggregate([
        {
          $match: { $expr: { $in: [userId, '$players'] } },
        },
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
            'players.avatar': 1,
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
        { $sort: { '_id.created_at': -1 } },
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

const countGamesByDay = async startDate => {
  const collection = mongo.db().collection(COLLECTION);

  try {
    const result = await collection
      .aggregate([
        {
          $addFields: {
            date: {
              $toDate: '$created_at',
            },
          },
        },
        {
          $match: {
            created_at: { $gt: startDate },
          },
        },
        {
          $group: {
            _id: {
              day_week: { $dayOfWeek: '$date' },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            '_id.day_week': 1,
          },
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const topUsersPlayMost = async () => {
  const collection = mongo.db().collection(COLLECTION);
  try {
    const users = await collection
      .aggregate([
        {
          $unwind: '$players',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'players',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $project: {
            'user.username': 1,
          },
        },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(users));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const topUserWinMost = async () => {
  const collection = mongo.db().collection(COLLECTION);
  try {
    const users = await collection
      .aggregate([
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
            'winner.username': 1,
          },
        },
        { $group: { _id: '$winner.username', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(users));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  insertOne,
  updateGameWinner,
  findAll,
  findGameById,
  findByUserId,
  findOne,
  findOneGameIncludeInforUser,
  findAllMessages,
  countGamesByDay,
  topUsersPlayMost,
  topUserWinMost,
};

const { get } = require('lodash'); // eslint-disable-line
const Result = require('folktale/result');

const generateSafeId = require('generate-safe-id');
const { LOGIN_TOPUP, PLAY_GAME } = require('../constants/coin.constant');
const { settingKey } = require('../../settingData');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'users';
const POINT_COLLECTION = 'pointlogs';
const SETTING_COLLECTION = 'settings';
const GAME_COLLECTION = 'games';

const getUserByEmail = async (email, provider) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);
    const user = await collection.findOne({ email, provider });

    return Promise.resolve(Result.Ok(user));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const getUserById = async id => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const user = await collection.findOne({ _id: id });

    return Promise.resolve(Result.Ok(user));
  } catch (error) {
    return Promise.resolve(error);
  }
};

const insertUser = async data => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const user = await collection.insertOne({
      ...data,
    });

    return Promise.resolve(Result.Ok(get(user, 'ops.0')));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const updateVerifiedCode = async (userId, code) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.updateOne(
      { _id: userId },
      { $set: { verified_code: code } }
    );

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const updateOne = async (condition, payload) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.updateOne(
      { ...condition },
      { $set: { ...payload } }
    );

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const getUserOnline = async userId => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const users = await collection
      .find({ $and: [{ _id: { $ne: userId } }, { role: 'USER' }] })
      .toArray();

    return Promise.resolve(Result.Ok(users));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const loginTopup = async userId => {
  try {
    const db = mongo.db();
    const runInTransaction = mongo.startTransaction();
    const userCollection = db.collection(COLLECTION);
    const pointLogCollection = db.collection(POINT_COLLECTION);
    const settingCollection = db.collection(SETTING_COLLECTION);

    const data = await runInTransaction(async session => {
      const setting = await settingCollection.findOne({
        key: settingKey.LOGIN_GIVEAWAY,
      });

      await userCollection.updateOne(
        { _id: userId },
        { $inc: { point: setting.value } },
        { session }
      );

      await userCollection.updateOne(
        { _id: userId },
        { $set: { has_topup: true } },
        { session }
      );

      await pointLogCollection.insertOne(
        {
          _id: generateSafeId(),
          type: LOGIN_TOPUP,
          value: setting.value,
          user_id: userId,
          created_at: new Date().getTime(),
        },
        { session }
      );
    });

    return Promise.resolve(Result.Ok(data));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const aggregate = async query => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.aggregate(query).toArray();

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const computePointUser = async ({
  roomId,
  gameId,
  userId,
  winnerId,
  point,
  chessBoard,
}) => {
  try {
    const db = mongo.db();
    const runInTransaction = mongo.startTransaction();
    const collection = db.collection(COLLECTION);
    const pointLogCollection = db.collection(POINT_COLLECTION);
    const gameCollection = db.collection(GAME_COLLECTION);

    const data = runInTransaction(async session => {
      await pointLogCollection.insertOne(
        {
          _id: generateSafeId(),
          type: PLAY_GAME,
          value: point,
          room_id: roomId,
          game_id: gameId,
          user_id: userId,
          created_at: new Date().getTime(),
        },
        { session }
      );

      await collection.updateOne(
        { _id: userId },
        { $inc: { point } },
        { session }
      );

      await gameCollection.updateOne(
        { _id: gameId },
        { $set: { steps: chessBoard, winner_id: winnerId } }
      );
    });

    return Promise.resolve(Result.Ok(data));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const computePoinLogsUser = async userId => {
  try {
    const db = mongo.db();
    const pointLogCollection = db.collection(POINT_COLLECTION);

    const result = await pointLogCollection
      .aggregate([
        {
          $match: { user_id: userId },
        },
        {
          $group: {
            _id: '$user_id',
            coin: { $sum: '$value' },
          },
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(result[0].coin));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findUserProfile = async userId => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);
    const pointLogCollection = db.collection(POINT_COLLECTION);
    const gameCollection = db.collection(GAME_COLLECTION);

    const [profile, point, game] = await Promise.all([
      collection.findOne({ _id: userId }),
      pointLogCollection
        .aggregate([
          {
            $group: {
              _id: '$user_id',
              count: { $sum: '$value' },
            },
          },
          {
            $match: {
              _id: userId,
            },
          },
        ])
        .toArray(),
      gameCollection
        .aggregate([
          {
            $unwind: '$players',
          },
          {
            $match: {
              players: userId,
            },
          },
          {
            $group: {
              _id: null,
              numberOfWins: {
                $sum: { $cond: [{ $eq: ['$winner_id', userId] }, 1, 0] },
              },
              numberOfMatches: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray(),
    ]);

    delete profile.password;
    delete profile.is_verified;
    delete profile.verified_code;
    delete profile.role;
    delete profile.provider;

    return Promise.resolve(
      Result.Ok({
        user: profile,
        point: point[0].count,
        number_of_wins: game[0].numberOfWins,
        number_of_loses: game[0].numberOfMatches - game[0].numberOfWins,
      })
    );
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  getUserByEmail,
  getUserById,
  insertUser,
  updateVerifiedCode,
  updateOne,
  getUserOnline,
  loginTopup,
  aggregate,
  computePointUser,
  computePoinLogsUser,
  findUserProfile,
};

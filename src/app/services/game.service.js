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

const updateRoom = async (roomId, players) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.updateOne(
      { _id: roomId },
      { $set: { players } }
    );

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const getAllRooms = async (userId, { offset, limit }) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const count = await collection.count();

    const result = await collection
      .aggregate([
        {
          $skip: (offset - 1) * limit,
        },
        {
          $limit: limit,
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
            'players.is_verified': 0,
            'players.verified_code': 0,
            'players.point': 0,
            'players.has_topup': 0,
            'players.role': 0,
            'players.provider': 0,
            'players.ref_id': 0,
          },
        },
      ])
      .toArray();

    const returnResult = result.map(r => {
      if (r.created_by === userId) return r;

      // eslint-disable-next-line no-param-reassign
      delete r.room_secret;

      return r;
    });

    return Promise.resolve(Result.Ok({ rooms: returnResult, count }));
  } catch (err) {
    return Promise.resolve(Result.Error(err));
  }
};

const appendPlayerInRoom = async (roomId, userId) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.update(
      { _id: roomId },
      { $push: { players: userId }, $set: { status: true } }
    );

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const removePlayerInRoom = async (roomId, userId) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.update(
      { _id: roomId },
      { $pull: { players: userId }, $set: { status: false } }
    );

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  insertOne,
  findOneGame,
  updateRoom,
  getAllRooms,
  appendPlayerInRoom,
  removePlayerInRoom,
};

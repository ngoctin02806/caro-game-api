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

const updateRoom = async (roomId, players, guests) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.updateOne(
      { _id: roomId },
      { $set: { players, guests } }
    );

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const getAllRooms = async () => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.find().toArray();

    return Promise.resolve(Result.Ok(result));
  } catch (err) {
    return Promise.resolve(Result.Error(err));
  }
};

const getRoom = async roomId => {
  try {
    const db = mongo.db();
    const result = await db.collection(COLLECTION).findOne({ _id: roomId });

    return Promise.resolve(Result.Ok(result));
  } catch (err) {
    return Promise.resolve(Result.Error(err));
  }
};

module.exports = {
  insertOne,
  findOneGame,
  updateRoom,
  getAllRooms,
  getRoom,
};

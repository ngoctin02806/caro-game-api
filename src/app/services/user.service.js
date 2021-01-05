const { get } = require('lodash'); // eslint-disable-line
const Result = require('folktale/result');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'users';

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

const getAllUsers = async ({ limit, offset }) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const users = await collection
      .aggregate([{ $limit: limit }, { $skip: (offset - 1) * limit }])
      .toArray();

    return Promise.resolve(Result.Ok(users));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const blockUser = async userId => {
  try {
    const collection = mongo.db().collection(COLLECTION);

    const result = await collection.updateOne(
      { _id: userId },
      { $set: { is_blocked: true } }
    );

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const unBlockUser = async userId => {
  try {
    const collection = mongo.db().collection(COLLECTION);

    const result = await collection.updateOne(
      { _id: userId },
      { $set: { is_blocked: false } }
    );

    return Promise.resolve(Result.Ok(result));
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
  getAllUsers,
  blockUser,
  unBlockUser,
};

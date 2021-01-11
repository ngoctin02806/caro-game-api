const Result = require('folktale/result');
const generateSafeId = require('generate-safe-id');
const config = require('config');

const mongo = require('../../core/mongo.core');
const { VNPAY_CHARGE } = require('../constants/coin.constant');

const COLLECTION = 'transactions';
const HIS_COLLECTION = 'transactionhistories';
const POINT_COLLECTION = 'pointlogs';
const USER_COLLECTION = 'users';

const findOne = async transactionId => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const transaction = await collection.findOne({ _id: transactionId });

    return Promise.resolve(Result.Ok(transaction));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const updateStatusTransaction = async (transactionId, transactionStatus) => {
  try {
    const db = mongo.db();
    const runInTransaction = mongo.startTransaction();

    const collection = db.collection(COLLECTION);
    const hisCollection = db.collection(HIS_COLLECTION);

    await runInTransaction(async session => {
      await collection.update(
        { _id: transactionId },
        { $set: { status: transactionStatus } },
        { session }
      );

      await hisCollection.insertOne(
        {
          _id: generateSafeId(),
          status: transactionStatus,
          created_at: new Date().getTime(),
          transaction_id: transactionId,
        },
        { session }
      );
    });

    return Promise.resolve(Result.Ok({ message: 'success' }));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const topUpPoint = async transactionId => {
  try {
    const db = mongo.db();
    const runInTransaction = mongo.startTransaction();

    const collection = db.collection(COLLECTION);
    const hisCollection = db.collection(HIS_COLLECTION);
    const pointLogsCollection = db.collection(POINT_COLLECTION);
    const userCollection = db.collection(USER_COLLECTION);

    await runInTransaction(async session => {
      const transaction = await collection.findOne(
        { _id: transactionId },
        { session }
      );

      await collection.update(
        { _id: transactionId },
        { $set: { status: 'PAID' } },
        { session }
      );

      await hisCollection.insertOne(
        {
          _id: generateSafeId(),
          status: 'PAID',
          created_at: new Date().getTime(),
          // eslint-disable-next-line no-underscore-dangle
          transaction_id: transaction._id,
        },
        { session }
      );

      await pointLogsCollection.insertOne(
        {
          _id: generateSafeId(),
          type: VNPAY_CHARGE,
          value: transaction.amount / 1000,
          user_id: transaction.created_by,
          // eslint-disable-next-line no-underscore-dangle
          transaction_id: transaction._id,
          created_at: new Date().getTime(),
        },
        { session }
      );

      await userCollection.update(
        { _id: transaction.created_by },
        { $inc: { point: transaction.amount / 1000 } },
        { session }
      );
    });

    return Promise.resolve(Result.Ok({ RspCode: '00', Message: 'Success' }));
  } catch (error) {
    return Promise.resolve(Result.Error(Error));
  }
};

const findAllTransactions = async ({
  userId,
  offset = 1,
  limit = config.get('LIMIT'),
}) => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const total = await collection.find({ created_by: userId }).count();

    const transactions = await collection
      .aggregate([
        {
          $match: {
            created_by: userId,
          },
        },
        {
          $sort: {
            created_at: -1,
          },
        },
        {
          $skip: (parseInt(offset, 10) - 1) * parseInt(limit, 10),
        },
        {
          $limit: parseInt(limit, 10),
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok({ transactions, total }));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const findAllTransactionHistories = async transactionId => {
  try {
    const db = mongo.db();
    const collection = db.collection(HIS_COLLECTION);

    const histories = await collection
      .find({ transaction_id: transactionId })
      .toArray();

    return Promise.resolve(Result.Ok(histories));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  findOne,
  topUpPoint,
  updateStatusTransaction,
  findAllTransactions,
  findAllTransactionHistories,
};

const Result = require('folktale/result');

const mongo = require('../../core/mongo.core');

const COLLECTION = 'transactionhistories';

// <BEGIN INSERT DATA>

const insertMany = async data => {
  const collection = mongo.db().collection(COLLECTION);
  try {
    const result = await collection.insertMany(data);

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

// </END INSERT DATA >

const countSaleAmountByDay = async startDate => {
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
            status: 'PAID',
            created_at: { $gt: startDate },
          },
        },
        {
          $project: {
            date: 1,
            'transaction_id.amount': 1,
          },
        },
        {
          $group: {
            _id: {
              day_week: { $dayOfWeek: '$date' },
            },
            total_amount: {
              $sum: '$transaction_id.amount',
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = { insertMany, countSaleAmountByDay };

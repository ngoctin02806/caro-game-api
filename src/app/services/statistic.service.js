const Result = require('folktale/result');

const mongo = require('../../core/mongo.core');

const USER_COLLECTION = 'users';
const POINT_COLLECTION = 'pointlogs';

const aggregateRankingTop = async () => {
  try {
    const db = mongo.db();
    const pointLogCollection = db.collection(POINT_COLLECTION);
    const userCollection = db.collection(USER_COLLECTION);

    const users = await userCollection.find().toArray();

    const stats = await pointLogCollection
      .aggregate([
        {
          $match: {
            user_id: { $in: users.map(u => u._id) }, // eslint-disable-line
          },
        },
        {
          $group: {
            _id: '$user_id',
            point_total: { $sum: '$value' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'users',
          },
        },
        {
          $unwind: '$users',
        },
        {
          $project: {
            'users.password': 0,
            'users.is_verified': 0,
            'users.verified_code': 0,
            'users.has_topup': 0,
            'users.role': 0,
            'users.provider': 0,
          },
        },
      ])
      .toArray();

    return Promise.resolve(Result.Ok(stats));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  aggregateRankingTop,
};

const mongo = require('../core/mongo.core');

const COLLECTION = 'users';

module.exports = async () => {
  const db = mongo.db();
  const collection = db.collection(COLLECTION);

  const result = await collection.updateMany({}, { has_topup: false });

  return Promise.resolve(result);
};

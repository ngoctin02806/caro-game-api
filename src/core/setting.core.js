const mongo = require('./mongo.core');
const { settingData } = require('../settingData');

const COLLECTION = 'settings';

module.exports.settingConfig = async () => {
  const db = mongo.db();
  const collection = db.collection(COLLECTION);

  const settings = await collection.find().toArray();

  /* eslint-disable */
  for (const settingItem of settingData) {
    const setting = settings.find(s => s.key === settingItem.key);

    if (!setting) {
      console.log('Add new setting data');
      await collection.insertOne({
        ...settingItem,
      });
    }
  }

  return Promise.resolve();
};

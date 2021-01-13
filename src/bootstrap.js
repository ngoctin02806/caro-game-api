const config = require('config');

const expressConfig = require('./core/express.core');
const mongoConfig = require('./core/mongo.core');
const { settingConfig } = require('./core/setting.core');

const { scheduleGiveaway } = require('./lib/nodeCronHelper');
const giveawayJob = require('./utils/giveawayJob');

const logger = require('./lib/logger');

const startServer = async () => {
  try {
    // eslint-disable-next-line
    await expressConfig();

    await mongoConfig.connect(config.get('MONGO_URL'));

    await settingConfig();

    await scheduleGiveaway('0 0 0 * * *', giveawayJob); // Reset has_topup properties of users
  } catch (error) {
    logger.error(error);
  }
};

startServer();

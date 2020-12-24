const config = require('config');
const expressConfig = require('./core/express.core');
const mongoConfig = require('./core/mongo.core');
const { settingConfig } = require('./core/setting.core');

const logger = require('./lib/logger');

const startServer = async () => {
  try {
    // eslint-disable-next-line
    await expressConfig();

    await mongoConfig.connect(config.get('MONGO_URL'));

    await settingConfig();
  } catch (error) {
    logger.error(error);
  }
};

startServer();

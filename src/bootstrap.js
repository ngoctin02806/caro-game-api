require('dotenv').config();

const config = require('config');
const expressConfig = require('./core/express.core');
const mongoConfig = require('./core/mongo.core');

const logger = require('./lib/logger');

const startServer = async () => {
  try {
    // eslint-disable-next-line
    await expressConfig();

    await mongoConfig.connect(config.get('MONGO_URL'));
  } catch (error) {
    logger.error(error);
  }
};

startServer();

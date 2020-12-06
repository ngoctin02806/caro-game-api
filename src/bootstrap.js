require('dotenv').config();

const expressConfig = require('./core/express.core');
const logger = require('./lib/logger');

const startServer = async () => {
  try {
    // eslint-disable-next-line
    await expressConfig();
  } catch (error) {
    logger.error(error);
  }
};

startServer();

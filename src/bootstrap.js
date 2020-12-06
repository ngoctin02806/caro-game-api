require('dotenv').config();

const expressConfig = require('./core/express.core');
const logger = require('./lib/logger');

const startServer = async () => {
  try {
    // eslint-disable-next-line
    const app = await expressConfig();

    app.get('/login', (req, res) => {
      return res.status(200).json({
        status: true,
        message: 'Success !',
      });
    });
  } catch (error) {
    logger.error(error);
  }
};

startServer();

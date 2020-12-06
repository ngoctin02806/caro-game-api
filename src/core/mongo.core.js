const { MongoClient } = require('mongodb');

const logger = require('../lib/logger');

const state = {
  db: null,
  client: null,
};

const connect = url =>
  // eslint-disable-next-line
  new Promise((resolve, reject) => {
    // eslint-disable-line
    if (state.db) return resolve(state.db);

    MongoClient.connect(
      url,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (error, client) => {
        // eslint-disable-line
        if (error) {
          logger.error('[MONGO] Connected to MONGODB failed !');
          return reject(error);
        }

        state.db = client.db();
        state.client = client;

        logger.info(`[MONGO] Connected to ${url}`);

        return resolve(state.client);
      }
    );
  });

const close = () =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line
    state.client.close((error, result) => {
      if (error) return reject(error);

      state.db = null;
      return resolve();
    });
  });

const db = () => state.db;

const client = () => state.client;

module.exports = {
  connect,
  close,
  db,
  client,
};

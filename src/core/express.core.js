require('dotenv').config();

const express = require('express');
const morgan = require('morgan');

const router = require('../app/router');

const app = express();

module.exports = () =>
  new Promise((resolve, reject) => {
    try {
      app.use(morgan('dev'));

      app.use(router);

      app.listen(
        process.env.NODE_ENV === 'development' ? process.env.PORT : 3000,
        () => {
          /* eslint-disable-next-line */
          console.log(
            `Server is listening on ${
              process.env.NODE_ENV === 'development' ? process.env.PORT : 3000
            }`
          );
        }
      );

      resolve(app);
    } catch (error) {
      reject(error);
    }
  });

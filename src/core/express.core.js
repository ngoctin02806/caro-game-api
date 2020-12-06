require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const config = require('config');
const bodyParser = require('body-parser');

const router = require('../app/router');
const httpErrorsHelper = require('../lib/httpErrorsHelper');

const app = express();

module.exports = () =>
  new Promise((resolve, reject) => {
    try {
      app.use(morgan('dev'));

      // parse application/x-www-form-urlencoded
      app.use(bodyParser.urlencoded({ extended: false }));

      // parse application/json
      app.use(bodyParser.json());

      app.use(router);

      /* Catch 404 Not Found */
      app.use((req, res, next) => {
        const error = new Error('Resource does not exist');
        error.status = 404;
        next(error);
      });

      /* eslint-disable-next-line no-unused-vars */
      app.use((error, req, res, next) => {
        return res
          .status(error.status || 500)
          .json(httpErrorsHelper.notFound());
      });

      app.listen(
        process.env.NODE_ENV === 'development' ? config.get('PORT') : 3000,
        () => {
          /* eslint-disable-next-line */
          console.log(
            `Server is listening on ${
              process.env.NODE_ENV === 'development' ? config.get('PORT') : 3000
            }`
          );
        }
      );

      resolve(app);
    } catch (error) {
      reject(error);
    }
  });

require('dotenv').config();

// const fs = require('fs');
// const path = require('path');
// const https = require('https');

const express = require('express');
const morgan = require('morgan');
const config = require('config');
const bodyParser = require('body-parser');
const passport = require('passport');

const passportConfig = require('./passport.core'); // eslint-disable-line

const router = require('../routers/index');
const httpErrorsHelper = require('../lib/httpErrorsHelper');

const app = express();

// const server = https.createServer(
//   {
//     key: fs.readFileSync(path.resolve(__dirname, '../app/keys/server.key')),
//     cert: fs.readFileSync(path.resolve(__dirname, '../app/keys/server.cert')),
//   },
//   app
// );

module.exports = () =>
  new Promise((resolve, reject) => {
    try {
      app.use(morgan('dev'));

      app.use(passport.initialize());

      // parse application/x-www-form-urlencoded
      app.use(bodyParser.urlencoded({ extended: false }));

      // parse application/json
      app.use(bodyParser.json());

      app.use('/api/v1', router);

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
          .json(
            error.status
              ? httpErrorsHelper.notFound()
              : httpErrorsHelper.internalError(error.message)
          );
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

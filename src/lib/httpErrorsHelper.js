const createError = require('http-errors');

/* eslint-disable */
module.exports = {
  notFound: () =>
    new createError(404, 'not found', {
      errors: [{ code: 404, message: 'Resource does not exist' }],
    }),
  unauthorized: () =>
    new createError(401, 'unauthorized', {
      errors: [{ code: 401, message: 'Unauthorized' }],
    }),
  userNotExist: () =>
    new createError(400, 'user is not exist', {
      errors: [{ code: 400, message: 'User is not exist' }],
    }),
};

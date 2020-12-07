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
  incorrectlyPassword: () =>
    new createError(400, 'password is incorrectly', {
      errors: [{ code: 400, message: 'Password is incorrectly' }],
    }),
  badRequest: errors =>
    new createError(400, 'bad request', {
      errors,
    }),
};

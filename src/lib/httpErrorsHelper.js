const createError = require('http-errors');

/* eslint-disable */
module.exports = {
  internalError: message =>
    new createError(500, 'error internal server', {
      errors: [{ code: 5000, message }],
    }),
  notFound: () =>
    new createError(404, 'not found', {
      errors: [{ code: 7001, message: 'Resource does not exist' }],
    }),
  unauthorized: () =>
    new createError(401, 'unauthorized', {
      errors: [{ code: 7002, message: 'Unauthorized' }],
    }),
  userNotExist: () =>
    new createError(400, 'user is not exist', {
      errors: [{ code: 7003, message: 'User is not exist' }],
    }),
  incorrectlyPassword: () =>
    new createError(400, 'password is incorrectly', {
      errors: [{ code: 7004, message: 'Password is incorrectly' }],
    }),
  badRequest: errors =>
    new createError(400, 'bad request', {
      errors,
    }),
  userIsExist: () =>
    new createError(400, 'user is exist', {
      errors: [{ code: 7005, message: 'User is exist' }],
    }),
  userDoesNotValidateEmail: () =>
    new createError(400, 'user does not validate email', {
      errors: [{ code: 7006, message: 'User does not validate email' }],
    }),
};

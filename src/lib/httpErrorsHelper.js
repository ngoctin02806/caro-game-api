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
  codeDoesNotMatch: () =>
    new createError(400, 'code does not match', {
      errors: [{ code: 7007, message: 'code does not match' }],
    }),
  roomNotExist: () =>
    new createError(400, 'room is not exist', {
      errors: [{ code: 7008, message: 'Room is not exist' }],
    }),
  conversationNotExist: () =>
    new createError(400, 'conversation is not exist', {
      errors: [{ code: 7009, message: 'Conversation is not exist' }],
    }),
  userIsAlreadyInRoom: () =>
    new createError(400, 'user is already in room', {
      errors: [{ code: 7010, message: 'User is already in room' }],
    }),
  userNotMatch: () =>
    new createError(400, 'participant does not match', {
      errors: [{ code: 7011, message: 'Participant does not match' }],
    }),
  userHasTopUp: () =>
    new createError(400, 'user has login topup', {
      errors: [{ code: 7012, message: 'User has login topup' }],
    }),
  roomSecretDoesNotMatch: () =>
    new createError(400, 'room secret does not match', {
      errors: [{ code: 7013, message: 'Room secret does not match' }],
    }),
  userIsNotExistInRoom: () =>
    new createError(400, 'user is not exist in room', {
      errors: [{ code: 7014, message: 'User is not exist in room' }],
    }),
  gameNotExist: () =>
    new createError(400, 'game is not exist', {
      errors: [{ code: 7015, message: 'Game is not exist' }],
    }),
  gameNotBelongToRoom: () =>
    new createError(400, 'game does not belong to room', {
      errors: [{ code: 7016, message: 'Game does not belong to room' }],
    }),
  notEnoughPoint: () =>
    new createError(400, 'user does not enough point', {
      errors: [{ code: 7017, message: 'User does not enough point' }],
    }),
};

require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports.sign = payload =>
  new Promise((resolve, reject) => {
    jwt.sign(
      { ...payload },
      process.env.PRIVATE_KEY,
      { algorithm: 'HS256', expiresIn: '1h' },
      (error, token) => {
        if (error) return reject(error);
        return resolve(token);
      }
    );
  });

module.exports.verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.PUBLIC_KEY,
      { algorithms: 'HS256' },
      (error, decoded) => {
        if (error) return reject(error);
        return resolve(decoded);
      }
    );
  });

module.exports.decoded = token =>
  // eslint-disable-next-line
  new Promise((resolve, reject) => {
    resolve(jwt.decode(token));
  });

require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports.sign = payload =>
  new Promise((resolve, reject) => {
    jwt.sign(
      { ...payload },
      process.env.JWT_PRIVATE_KEY,
      { algorithm: 'RS256', expiresIn: '3h' },
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
      process.env.JWT_PUBLIC_KEY,
      { algorithms: ['RS256'] },
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

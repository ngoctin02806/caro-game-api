const bcrypt = require('bcryptjs');

module.exports.genSalt = saltNum =>
  new Promise((resolve, reject) => {
    bcrypt.genSalt(saltNum, (error, salt) => {
      if (error) reject(error);
      else resolve(salt);
    });
  });

module.exports.hashPassword = (salt, password) =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (error, hash) => {
      if (error) reject(error);
      else resolve(hash);
    });
  });

module.exports.comparePassword = (password, hashPassword) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hashPassword, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USR,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  },
  test: {
    username: process.env.DB_USR_TEST,
    password: process.env.DB_PWD_TEST,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST_TEST,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USR,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    host: process.env.DATABASE_URL,
    dialect: 'mysql',
    logging: false,
  },
};

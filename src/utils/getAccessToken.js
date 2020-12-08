require('dotenv').config();

const axios = require('axios');

const requestUrl = 'https://accounts.google.com/o/oauth2/token';

module.exports = () =>
  /* eslint-disable-next-line */
  axios(requestUrl, {
    method: 'POST',
    data: {
      client_id: process.env.GOOGLE_APP_CLIENT_ID,
      client_secret: process.env.GOOGLE_APP_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    },
  }).then(res => res.data);

require('dotenv').config();

const nodemailer = require('nodemailer');

const getAccessToken = require('../utils/getAccessToken');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    clientId: process.env.GOOGLE_APP_CLIENT_ID,
    clientSecret: process.env.GOOGLE_APP_CLIENT_SECRET,
  },
});

module.exports.nodemailerHelper = async (email, content) => {
  getAccessToken()
    .then(res => {
      return transporter.sendMail({
        from: 'nnt.hcmus.0409@gmail.com',
        to: email,
        subject: 'Caro game - Xác thực tài khoản',
        text: `Mã xác thực email: ${content}`,
        html: `<div>
                    <div style="font-size: 20px; font-weight: bold;">Hệ thống trò chơi GAME CARO</div>
                    <div style="background-color: #14aaf5; color: #fff; border-radius: 4px; padding: 10px; border: 1px solid #14aaf5">Mã xác thực: <code style="padding: 5px; background-color: #f6f6f6; border-radius: 4px; color: #000; font-weight: bold;">${content}</code></div>
                <div>`,
        auth: {
          user: 'nnt.hcmus.0409@gmail.com',
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: res.access_token,
          expires: res.expires_in,
        },
      });
    })
    .catch(e => {
      console.log(`Send email error: ${e}`);
    });
};

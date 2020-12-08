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

const templateValidateMail = (data, email) => ({
  from: 'nnt.hcmus.0409@gmail.com',
  to: email,
  subject: 'Caro game - Xác thực tài khoản',
  html: `<div>
          <div style="font-size: 20px; font-weight: bold;">Hệ thống trò chơi GAME CARO</div>
          <div style="background-color: #14aaf5; color: #fff; border-radius: 4px; padding: 10px; border: 1px solid #14aaf5">Mã xác thực: <code style="padding: 5px; background-color: #f6f6f6; border-radius: 4px; color: #000; font-weight: bold;">${data}</code></div>
        <div>`,
});

const templateChangePasswordMail = (data, email) => ({
  from: 'nnt.hcmus.0409@gmail.com',
  to: email,
  subject: 'Caro game - Thay đổi mật khẩu mới',
  html: `<div>
          <div style="font-size: 20px; font-weight: bold;">Hệ thống trò chơi GAME CARO</div>
          <div style="font-size: 15px; margin: 5px 0px;">Xin chào ${data.username} !</div>
          <div style="font-size: 15px; margin: 5px 0px;">Bạn đã yêu cầu thay đổi mật khẩu với tài khoản này ${email}</div>
          <div style="font-size: 15px; margin: 5px 0px;">Để thay đổi mật khẩu, click vào button bên dưới</div>
          <a href="${data.host_fe}/${data.path_name}?signature=${data.signature}" style="text-align: center; display: block; text-decoration: none; width: 130px; background-color: #14aaf5; color: #fff; border-radius: 4px; padding: 10px; border: 1px solid #14aaf5">
            Thay đổi mật khẩu
          </a>
        <div>`,
});

module.exports.nodemailerHelper = async ({
  email,
  verified_code, // eslint-disable-line
  username,
  signature,
  host_fe, // eslint-disable-line
  path_name, // eslint-disable-line
}) => {
  const mailOptions = !username
    ? templateValidateMail(verified_code, email)
    : templateChangePasswordMail(
        { username, host_fe, path_name, signature },
        email
      );

  getAccessToken()
    .then(res => {
      return transporter.sendMail({
        ...mailOptions,
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

const { Subject } = require('rxjs');

const { nodemailerHelper } = require('../lib/nodemailerHelper');

const onRequestChangePassword = new Subject();

/* eslint-disable */
onRequestChangePassword.subscribe(
  ({ email, username, signature, host_fe, path_name }) => {
    nodemailerHelper({ email, username, signature, host_fe, path_name });
  }
);

module.exports = {
  onRequestChangePassword,
};

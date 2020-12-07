const { Subject } = require('rxjs');

const { nodemailerHelper } = require('../lib/nodemailerHelper');

const onSendEmailEvent = new Subject();

/* eslint-disable-next-line */
onSendEmailEvent.subscribe(({ email, verified_code }) => {
  nodemailerHelper({ email, verified_code });
});

module.exports = {
  onSendEmailEvent,
};

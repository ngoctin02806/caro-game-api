const { Subject } = require('rxjs');

const onSendEmailEvent = new Subject();

onSendEmailEvent.subscribe(x => {
  console.log(x);
});

module.exports = {
  onSendEmailEvent,
};

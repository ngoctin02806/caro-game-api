const cron = require('node-cron');

// eslint-disable-next-line camelcase
module.exports.scheduleGiveaway = (schedule_time, callback) =>
  new Promise((resolve, reject) => {
    cron.schedule(schedule_time, async error => {
      if (error) return reject(error);

      const now = new Date();
      const time = `${now.getDay()}-${now.getMonth() + 1}-${now.getFullYear()}`;

      console.log(`Running a task every day - ${time}`);

      await callback();

      return resolve();
    });
  });

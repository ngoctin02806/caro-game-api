const transactionService = require('../services/transaction.service');
const userService = require('../services/user.service');
const gameService = require('../services/game1.service');

const {
  transactionhistories,
} = require('../../sampleData/transactionhistories');

// <BEGIN INSERT DATA>

module.exports.insertTransactionHistories = async (req, res, next) => {
  try {
    const result = await transactionService.insertMany(transactionhistories);

    if (result.value instanceof Error) throw result.value;

    return res.status(200).json({ data: result.value });
  } catch (error) {
    return next(error);
  }
};

// </END INSERT DATA >

// <HELPER >

function startOfWeek(date) {
  const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

  const rs = new Date(date.setDate(diff));
  return rs.setHours(0, 0, 0, 0);
}

const numberToDayWeek = number => {
  const data = {
    1: 'Chủ nhật',
    2: 'Thứ 2',
    3: 'Thứ 3',
    4: 'Thứ 4',
    5: 'Thứ 5',
    6: 'Thứ 6',
    7: 'Thứ 7',
  };

  return data[number];
};

// </HELPER >

// ---

module.exports.countSaleAmountByDay = async (req, res, next) => {
  const startDate = startOfWeek(new Date());

  try {
    const data = await transactionService.countSaleAmountByDay(startDate);

    if (data.value instanceof Error) throw data.value;

    const formattedData = [];
    data.value.map(item =>
      formattedData.push({
        ...item._id, // eslint-disable-line
        total_amount: item.total_amount,
        str_day_week: numberToDayWeek(item._id.day_week), // eslint-disable-line
      })
    );

    const lastDayWeek = formattedData[formattedData.length - 1].day_week;
    const result = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1, j = 0; i <= lastDayWeek; i++) {
      if (i === formattedData[j].day_week) {
        result.push(formattedData[j]);
        // eslint-disable-next-line no-plusplus
        j++;
      } else {
        result.push({
          day_week: i,
          total_amount: 0,
          str_day_week: numberToDayWeek(i),
        });
      }
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.countSaleAmountByWeek = async (req, res, next) => {
  try {
    const data = await transactionService.countSaleAmountByWeek();

    if (data.value instanceof Error) throw data.value;

    const formattedData = [];
    data.value.map(item =>
      // eslint-disable-next-line no-underscore-dangle
      formattedData.push({ ...item._id, total_amount: item.total_amount })
    );

    const lastWeekCount = formattedData[formattedData.length - 1].week;
    const result = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1, j = 0; i <= lastWeekCount; i++) {
      if (i === formattedData[j].week) {
        result.push({
          week: formattedData[j].week.toString(),
          total_amount: formattedData[j].total_amount,
        });
        // eslint-disable-next-line no-plusplus
        j++;
      } else {
        result.push({ week: i.toString(), total_amount: 0 });
      }
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.countSaleAmountByMonth = async (req, res, next) => {
  const now = new Date();
  const nowYear = now.getFullYear();

  try {
    const data = await transactionService.countSaleAmountByMonth(nowYear);

    if (data.value instanceof Error) throw data.value;

    const formattedData = [];
    data.value.map(item =>
      formattedData.push({
        date: item._id.month + '/' + item._id.year, // eslint-disable-line
        total_amount: item.total_amount,
        month: item._id.month, // eslint-disable-line
        year: item._id.year, // eslint-disable-line
      })
    );

    const result = [];
    const lastYear = nowYear - 1;
    let j = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= 12; i++) {
      if (formattedData[j].year !== lastYear) {
        break;
      } else if (i === formattedData[j].month) {
        result.push(formattedData[j]);
        // eslint-disable-next-line no-plusplus
        j++;
      } else {
        result.push({
          // eslint-disable-next-line prefer-template
          date: i + '/' + lastYear,
          total_amount: 0,
          month: i,
          year: lastYear,
        });
      }
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= 12 && j < formattedData.length; i++) {
      if (formattedData[j].year !== nowYear) {
        break;
      } else if (i === formattedData[j].month) {
        result.push(formattedData[j]);
        // eslint-disable-next-line no-plusplus
        j++;
      } else {
        result.push({
          // eslint-disable-next-line prefer-template
          date: i + '/' + nowYear,
          total_amount: 0,
          month: i,
          year: nowYear,
        });
      }
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.countSaleAmountByYear = async (req, res, next) => {
  try {
    const data = await transactionService.countSaleAmountByYear();

    if (data.value instanceof Error) throw data.value;

    const result = [];
    data.value.map(item =>
      result.push({
        // eslint-disable-next-line no-underscore-dangle
        year: item._id.year.toString(),
        total_amount: item.total_amount,
      })
    );

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.topTopupUsers = async (req, res, next) => {
  try {
    const data = await transactionService.topTopupUsers();

    if (data.value instanceof Error) throw data.value;

    const result = [];
    data.value.map(item =>
      // eslint-disable-next-line no-underscore-dangle
      result.push({ user: item._id.user[0], total_amount: item.total_amount })
    );

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.statsTransactionsType = async (req, res, next) => {
  try {
    const data = await transactionService.statsTransactionsType();

    if (data.value instanceof Error) throw data.value;

    const result = [];
    data.value.map(item =>
      // eslint-disable-next-line no-underscore-dangle
      result.push({ type: item._id.type, total_amount: item.total_amount })
    );

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.statsAccountProvider = async (req, res, next) => {
  try {
    const data = await userService.statsAccountProvider();

    if (data.value instanceof Error) throw data.value;

    const result = [];
    data.value.map(item =>
      // eslint-disable-next-line no-underscore-dangle
      result.push({ provider: item._id.provider, count: item.count })
    );

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.statsGamesByDay = async (req, res, next) => {
  const startDate = startOfWeek(new Date());

  try {
    const data = await gameService.countGamesByDay(startDate);

    if (data.value instanceof Error) throw data.value;

    const formattedData = [];
    data.value.map(item =>
      formattedData.push({
        ...item._id, // eslint-disable-line
        count: item.count,
        str_day_week: numberToDayWeek(item._id.day_week), // eslint-disable-line
      })
    );

    const lastDayWeek = formattedData[formattedData.length - 1].day_week;
    const result = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1, j = 0; i <= lastDayWeek; i++) {
      if (i === formattedData[j].day_week) {
        result.push(formattedData[j]);
        // eslint-disable-next-line no-plusplus
        j++;
      } else {
        result.push({
          day_week: i,
          count: 0,
          str_day_week: numberToDayWeek(i),
        });
      }
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.topUsersPlayMost = async (req, res, next) => {
  try {
    const data = await gameService.topUsersPlayMost();

    if (data.value instanceof Error) throw data.value;

    const result = [];
    data.value.map((item, pos) =>
      // eslint-disable-next-line no-underscore-dangle
      result.push({ index: pos + 1, ...item._id[0], count: item.count })
    );

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports.topUserWinMost = async (req, res, next) => {
  try {
    const data = await gameService.topUserWinMost();

    if (data.value instanceof Error) throw data.value;

    const result = [];
    data.value.map((item, pos) =>
      // eslint-disable-next-line no-underscore-dangle
      result.push({ index: pos + 1, username: item._id[0], count: item.count })
    );

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

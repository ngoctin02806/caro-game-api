const transactionService = require('../services/transaction.service');

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
    1: 'Sunday',
    2: 'Monday',
    3: 'Tuesday',
    4: 'Wednesday',
    5: 'Thursday',
    6: 'Friday',
    7: 'Saturday',
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
        });
      }
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
};

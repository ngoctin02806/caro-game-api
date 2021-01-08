const querystring = require('qs');
const sha256 = require('sha256');

const { MOMO, VNPAY } = require('../constants/payment.constant');
const paymentSrv = require('../services/payment.service');
const transactionSrv = require('../services/transaction.service');
const settingSrv = require('../services/setting.service');
const { sortObject } = require('../../utils/f');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');

module.exports.generateTransaction = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { amount, option, type } = req.body;

    switch (type) {
      case MOMO: {
        const data = await paymentSrv.initMoMoTransaction({
          userId,
          data: option,
          amount,
        });

        if (data.value instanceof Error) throw data.value;

        return res.status(200).json({ ...data.value });
      }
      case VNPAY: {
        const ipAddr =
          req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;

        const data = await paymentSrv.initVnPayTransaction({
          userId,
          data: option,
          amount,
          configData: { ipAddr },
        });

        if (data.value instanceof Error) throw data.value;

        return res.status(200).json({ ...data.value });
      }
      default:
        return res.status(200).json({});
    }
  } catch (error) {
    return next(error);
  }
};

module.exports.getAllTransactions = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { offset, limit } = req.query;

    const transactions = await transactionSrv.findAllTransactions({
      userId,
      offset,
      limit,
    });

    if (transactions.value instanceof Error) throw transactions.value;

    return res.status(200).json({
      total: transactions.value.total,
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
      transactions: transactions.value.transactions,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.getAllTransactionHistories = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await transactionSrv.findOne(transactionId);

    if (transaction.value instanceof Error) throw transaction.value;

    if (!transaction.value)
      return res.status(400).json(httpErrorsHelper.transactionNotExist());

    const histories = await transactionSrv.findAllTransactionHistories(
      transactionId
    );

    if (histories.value instanceof Error) throw histories.value;

    return res.status(200).json({ histories: histories.value });
  } catch (error) {
    return next(error);
  }
};

/* Provider webhook controller for VNPAY */
module.exports.vnpayWebhook = async (req, res) => {
  try {
    // eslint-disable-next-line camelcase
    let vnp_Params = req.query;
    const secureHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    // eslint-disable-next-line camelcase
    vnp_Params = sortObject(vnp_Params);
    const vnpData = await settingSrv.findOne('VNPAY_PAYMENT');

    if (vnpData.value instanceof Error) throw vnpData.value;

    const { vnay_HashSecret: secretKey } = vnpData.value.value;

    const signData =
      secretKey + querystring.stringify(vnp_Params, { encode: false });

    const checkSum = sha256(signData);

    if (secureHash === checkSum) {
      const transactionId = vnp_Params.vnp_TxnRef;
      const rspCode = vnp_Params.vnp_ResponseCode;

      const transaction = await transactionSrv.findOne(transactionId);

      if (transaction.value instanceof Error) throw transaction.value;

      if (!transaction.value)
        return res
          .status(200)
          .json({ RspCode: '01', Message: 'Transaction is not exist' });

      if (rspCode !== '00') {
        await transactionSrv.updateStatusTransaction(transactionId, 'FAILED');

        return res.status(200).json({ RspCode: rspCode, Message: 'Fail' });
      }

      const data = await transactionSrv.topUpPoint(transactionId);

      if (data.value instanceof Error) throw data.value;

      return res.status(200).json(data.value);
    }

    return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
  } catch (error) {
    return res.status(200).json({ RspCode: '99', Message: 'Fail' });
  }
};

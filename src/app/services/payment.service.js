/* eslint-disable camelcase */
const crypto = require('crypto');

const Result = require('folktale/result');
const axios = require('axios');
const generateSafeId = require('generate-safe-id');
const config = require('config');
const _ = require('lodash');
const dateFormat = require('dateformat');
const sha256 = require('sha256');
const querystring = require('qs');

const mongo = require('../../core/mongo.core');
const { MOMO, VNPAY } = require('../constants/payment.constant');
const { sortObject } = require('../../utils/f');

const TRANSACTION_COLLECTION = 'transactions';
const TRANSACTION_HIS_COLLECTION = 'transactionhistories';
const SETTING_COLLECTION = 'settings';

const initMoMoTransaction = async ({ userId, data, amount }) => {
  try {
    const db = mongo.db();
    const runInTransaction = mongo.startTransaction();
    const transactionCollection = db.collection(TRANSACTION_COLLECTION);
    const transactionHisCollection = db.collection(TRANSACTION_HIS_COLLECTION);
    const settingCollection = db.collection(SETTING_COLLECTION);

    let result = null;

    await runInTransaction(async session => {
      const { value } = await settingCollection.findOne(
        {
          key: 'MOMO_PAYMENT',
        },
        { session }
      );

      const {
        partner_code,
        access_key,
        secret_key,
        notiUrl,
        returnUrl,
      } = value;

      const transaction = await transactionCollection.insertOne(
        {
          _id: generateSafeId(),
          data,
          amount,
          status: 'WAITING',
          type: MOMO,
          created_at: new Date().getTime(),
          created_by: userId,
        },
        { session }
      );

      await transactionHisCollection.insertOne(
        {
          _id: generateSafeId(),
          status: 'WAITING',
          created_at: new Date().getTime(),
          transaction_id: _.get(transaction, 'ops.0'),
        },
        { session }
      );

      const prepareData = {
        accessKey: access_key,
        partnerCode: partner_code,
        requestType: 'captureMoMoWallet',
        notifyUrl: notiUrl,
        returnUrl,
        orderId: _.get(transaction, 'ops.0._id'),
        requestId: _.get(transaction, 'ops.0._id'),
        orderInfo: data.description,
        amount: `${amount}`,
        extraData: `transaction_id=${_.get(
          transaction,
          'ops.0._id'
        )};user_id=${userId}`,
      };

      const rawData = `partnerCode=${prepareData.partnerCode}&accessKey=${prepareData.accessKey}&requestId=${prepareData.requestId}&amount=${prepareData.amount}&orderId=${prepareData.orderId}&orderInfo=${prepareData.orderInfo}&returnUrl=${prepareData.returnUrl}&notifyUrl=${prepareData.notifyUrl}&extraData=${prepareData.extraData}`;

      const signature = crypto
        .createHmac('sha256', secret_key)
        .update(rawData)
        .digest('hex');

      const momoResponse = await axios(
        `${config.get('MOMO_HOST')}/gw_payment/transactionProcessor`,
        {
          method: 'POST',
          data: {
            ...prepareData,
            signature,
          },
        }
      );

      result = {
        pay_url: momoResponse.data.payUrl,
        transaction: {
          ..._.get(transaction, 'ops.0'),
        },
      };
    });

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

const initVnPayTransaction = async ({ userId, data, amount, configData }) => {
  try {
    const db = mongo.db();
    const runInTransaction = mongo.startTransaction();
    const transactionCollection = db.collection(TRANSACTION_COLLECTION);
    const transactionHisCollection = db.collection(TRANSACTION_HIS_COLLECTION);
    const settingCollection = db.collection(SETTING_COLLECTION);

    let result = null;

    await runInTransaction(async session => {
      // eslint-disable-next-line no-unused-vars
      let vnpUrl = config.get('VNPAY_HOST');

      const { value } = await settingCollection.findOne(
        {
          key: 'VNPAY_PAYMENT',
        },
        { session }
      );

      const { vnay_HashSecret, vnpay_TmnCode, returnUrl } = value;
      const now = new Date();

      const transaction = await transactionCollection.insertOne(
        {
          _id: generateSafeId(),
          data,
          amount,
          status: 'WAITING',
          type: VNPAY,
          created_at: new Date().getTime(),
          created_by: userId,
        },
        { session }
      );

      await transactionHisCollection.insertOne(
        {
          _id: generateSafeId(),
          status: 'WAITING',
          created_at: new Date().getTime(),
          transaction_id: _.get(transaction, 'ops.0._id'),
        },
        { session }
      );

      let vnp_Params = {};
      vnp_Params.vnp_Version = '2';
      vnp_Params.vnp_Command = 'pay';
      vnp_Params.vnp_TmnCode = vnpay_TmnCode;
      vnp_Params.vnp_Locale = 'vn';
      vnp_Params.vnp_CurrCode = 'VND';
      vnp_Params.vnp_TxnRef = _.get(transaction, 'ops.0._id');
      vnp_Params.vnp_OrderInfo = userId;
      // vnp_Params.vnp_OrderType = orderType;
      vnp_Params.vnp_Amount = amount * 100;
      vnp_Params.vnp_ReturnUrl = returnUrl;
      vnp_Params.vnp_IpAddr = configData.ipAddr;
      vnp_Params.vnp_CreateDate = dateFormat(now, 'yyyymmddHHmmss');
      // vnp_Params.vnp_BankCode = bankCode;

      vnp_Params = sortObject(vnp_Params);

      const signData =
        vnay_HashSecret + querystring.stringify(vnp_Params, { encode: false });

      const secureHash = sha256(signData);

      vnp_Params.vnp_SecureHashType = 'SHA256';
      vnp_Params.vnp_SecureHash = secureHash;
      vnpUrl += `?${querystring.stringify(vnp_Params, { encode: true })}`;

      result = {
        pay_url: vnpUrl,
        transaction: {
          ..._.get(transaction, 'ops.0'),
        },
      };
    });

    return Promise.resolve(Result.Ok(result));
  } catch (error) {
    return Promise.resolve(Result.Error(error));
  }
};

module.exports = {
  initMoMoTransaction,
  initVnPayTransaction,
};

require('dotenv').config();

const Type = {
  Number: 'number',
  String: 'string',
  Object: 'object',
};

module.exports.settingKey = {
  LOGIN_GIVEAWAY: 'LOGIN_GIVEAWAY',
  MOMO_PAYMENT: 'MOMO_PAYMENT',
  VNPAY_PAYMENT: 'VNPAY_PAYMENT',
};

module.exports.settingData = [
  {
    type: Type.Number,
    key: this.settingKey.LOGIN_GIVEAWAY,
    value: 50,
    description: 'Số lượng coin được tặng khi đăng nhập ngày mới',
    readonly: false,
  },
  {
    type: Type.Object,
    key: this.settingKey.MOMO_PAYMENT,
    value: {
      partner_code: 'MOMOJNLP20210105',
      access_key: '5FMBQ52KiZspLa6N',
      secret_key: 'XvEAd13IDtOEWcQOMXCVHPOisS04UZw5',
      notiUrl: 'http://localhost:8000',
      returnUrl: 'http://www.hcmusedu.info',
    },
    description: 'Thông tin bảo mật của thanh toán momo',
    readonly: false,
  },
  {
    type: Type.Object,
    key: this.settingKey.VNPAY_PAYMENT,
    value: {
      vnay_HashSecret: process.env.VNPAY_HASHSECRET,
      vnpay_TmnCode: process.env.VNPAY_TMNCODE,
      returnUrl: process.env.VNPAY_RETURN_URL,
      notify: process.env.VNPAY_IPN,
    },
    description: 'Thông tin bảo mật của thanh toán vnpay',
    readonly: false,
  },
];

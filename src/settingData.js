const Type = {
  Number: 'number',
  String: 'string',
};

module.exports.settingKey = {
  LOGIN_GIVEAWAY: 'LOGIN_GIVEAWAY',
};

module.exports.settingData = [
  {
    type: Type.Number,
    key: this.settingKey.LOGIN_GIVEAWAY,
    value: 50,
    description: 'Số lượng coin được tặng khi đăng nhập ngày mới',
    readonly: false,
  },
];

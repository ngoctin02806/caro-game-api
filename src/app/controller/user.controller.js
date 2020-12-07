const { onSendEmailEvent } = require('../../event/onSendEmail.event'); // eslint-disable-line
const userService = require('../services/user.service');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');
const bcryptjsHelper = require('../../lib/bcryptjs');
const jwtHelper = require('../../lib/jwtHelper');

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getUserByEmail(email);

    if (user.value instanceof Error) throw user.value;

    if (!user.value)
      return res.status(400).json(httpErrorsHelper.userNotExist());

    const comparePassword = await bcryptjsHelper.comparePassword(
      password,
      user.value.password
    );

    if (!comparePassword)
      return res.status(400).json(httpErrorsHelper.incorrectlyPassword());

    const token = await jwtHelper.sign({
      _id: user.value._id, // eslint-disable-line
      email: user.value.email,
      _role: user.value.role,
    });

    delete user.value.password;
    delete user.value.verified_code;

    return res.status(200).json({
      data: {
        user: {
          ...user.value,
        },
        auth: {
          token,
          expire_in: 3 * 60 * 60 * 1000, // 3h
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

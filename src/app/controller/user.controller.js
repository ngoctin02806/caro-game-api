const shortid = require('shortid');
const generateSafeId = require('generate-safe-id');

const { onSendEmailEvent } = require('../../event/onSendEmail.event'); // eslint-disable-line
const {
  onRequestChangePassword,
} = require('../../event/onRequestChangePassword.event');
const userService = require('../services/user.service');
const httpErrorsHelper = require('../../lib/httpErrorsHelper');
const bcryptjsHelper = require('../../lib/bcryptjs');
const jwtHelper = require('../../lib/jwtHelper');
const { USER_ROLE } = require('../constants/role.constant');

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

module.exports.register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const user = await userService.getUserByEmail(email);

    if (user.value instanceof Error) throw user.value;

    if (user.value) return res.status(400).json(httpErrorsHelper.userIsExist());

    const verifiedCode = shortid.generate();
    const salt = await bcryptjsHelper.genSalt(10);
    const hashPassword = await bcryptjsHelper.hashPassword(salt, password);

    const newUser = await userService.insertUser({
      _id: generateSafeId(),
      username,
      email,
      password: hashPassword,
      is_verified: false,
      verified_code: verifiedCode,
      role: USER_ROLE,
    });

    if (newUser.value instanceof Error) throw newUser.value;

    onSendEmailEvent.next({ email, verified_code: verifiedCode });

    const token = await jwtHelper.sign({
      _id: newUser.value._id, // eslint-disable-line
      email: newUser.value.email,
      _role: newUser.value.role,
    });

    return res.status(201).json({
      data: {
        user: {
          _id: newUser.value._id, // eslint-disable-line
          username: newUser.value.username,
          email: newUser.value.email,
          is_verified: newUser.value.is_verified,
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

module.exports.activateAccount = async (req, res, next) => {
  try {
    const { code } = req.body;
    const { _id } = req.user;

    const user = await userService.getUserById(_id);

    if (user.value instanceof Error) throw user.value;

    if (user.value.verified_code !== code)
      return res.status(400).json(httpErrorsHelper.codeDoesNotMatch());

    const result = await userService.updateOne({ _id }, { is_verified: true });

    if (result.value instanceof Error) throw result.value;

    return res.status(200).json({
      data: {
        message: 'Activate successfully',
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.getVerifiedCode = async (req, res, next) => {
  try {
    const { _id, email } = req.user;

    const verifiedCode = shortid.generate();

    const result = await userService.updateOne(
      { _id },
      { verified_code: verifiedCode }
    );

    if (result.value instanceof Error) throw result.value;

    onSendEmailEvent.next({ email, verified_code: verifiedCode });

    return res.status(200).json({
      data: {
        message: 'Send mail successfully',
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.sendMailToChangePassword = async (req, res, next) => {
  try {
    const { email, host_fe, path_name } = req.body; // eslint-disable-line

    const user = await userService.getUserByEmail(email);

    if (user.value instanceof Error) throw user.value;

    if (!user.value)
      return res.status(400).json(httpErrorsHelper.userNotExist());

    const signature = await jwtHelper.sign({
      _id: user.value._id, // eslint-disable-line
      email: user.value.email,
    });

    onRequestChangePassword.next({
      email: user.value.email,
      username: user.value.username,
      signature,
      host_fe,
      path_name,
    });

    return res.status(200).json({
      data: {
        message: 'Send message successfully',
      },
    });
  } catch (error) {
    return next(error);
  }
};

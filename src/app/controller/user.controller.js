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
const {
  LOCAL_PROVIDER,
  GOOGLE_PROVIDER,
  FACEBOOK_PROVIDER,
} = require('../constants/provider.constant');

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getUserByEmail(email, LOCAL_PROVIDER);

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
      _verified: user.value.is_verified,
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
          expire_in: new Date().getTime() + 3 * 60 * 60 * 1000, // 3h
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

    const user = await userService.getUserByEmail(email, LOCAL_PROVIDER);

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
      provider: LOCAL_PROVIDER,
    });

    if (newUser.value instanceof Error) throw newUser.value;

    onSendEmailEvent.next({ email, verified_code: verifiedCode });

    const token = await jwtHelper.sign({
      _id: newUser.value._id, // eslint-disable-line
      email: newUser.value.email,
      _role: newUser.value.role,
      _verified: newUser.value.is_verified,
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
          expire_in: new Date().getTime() + 3 * 60 * 60 * 1000, // 3h
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

    const user = await userService.getUserByEmail(email, LOCAL_PROVIDER);

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

module.exports.googleLogin = async (req, res, next) => {
  try {
    const { user } = req;

    const existUser = await userService.getUserByEmail(
      user.emails[0].value,
      GOOGLE_PROVIDER
    );

    if (existUser.value instanceof Error) throw existUser.value;

    if (!existUser.value) {
      const newUser = await userService.insertUser({
        _id: generateSafeId(),
        username: user.displayName,
        email: user.emails[0].value,
        avatar: user._json.picture, // eslint-disable-line
        provider: GOOGLE_PROVIDER,
        role: USER_ROLE,
        ref_id: user.id,
        is_verified: true,
      });

      if (newUser.value instanceof Error) throw newUser.value;

      const token = await jwtHelper.sign({
        _id: newUser.value._id, // eslint-disable-line
        email: newUser.value.email,
        _role: newUser.value.role,
        _verified: true,
      });

      return res.status(201).json({
        data: {
          user: {
            ...newUser.value,
          },
          auth: {
            token,
            expire_in: new Date().getTime() + 3 * 60 * 60 * 1000, // 3h
          },
        },
      });
    }

    const token = await jwtHelper.sign({
      _id: existUser.value._id, // eslint-disable-line
      email: existUser.value.email,
      _role: existUser.value.role,
      _verified: true,
    });

    return res.status(200).json({
      data: {
        user: {
          ...existUser.value,
        },
        auth: {
          token,
          expire_in: new Date().getTime() + 3 * 60 * 60 * 1000, // 3h
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.facebookLogin = async (req, res, next) => {
  try {
    const { user } = req;

    const existUser = await userService.getUserByEmail(
      user.emails[0].value,
      FACEBOOK_PROVIDER
    );

    if (existUser.value instanceof Error) throw existUser.value;

    if (!existUser.value) {
      const newUser = await userService.insertUser({
        _id: generateSafeId(),
        username: user.displayName,
        email: user.emails[0].value,
        avatar: user.photos[0].value, // eslint-disable-line
        provider: FACEBOOK_PROVIDER,
        role: USER_ROLE,
        ref_id: user.id,
        is_verified: true,
      });

      if (newUser.value instanceof Error) throw newUser.value;

      const token = await jwtHelper.sign({
        _id: newUser.value._id, // eslint-disable-line
        email: newUser.value.email,
        _role: newUser.value.role,
        _verified: true,
      });

      return res.status(201).json({
        data: {
          user: {
            ...newUser.value,
          },
          auth: {
            token,
            expire_in: new Date().getTime() + 3 * 60 * 60 * 1000, // 3h
          },
        },
      });
    }

    const token = await jwtHelper.sign({
      _id: existUser.value._id, // eslint-disable-line
      email: existUser.value.email,
      _role: existUser.value.role,
      _verified: true,
    });

    return res.status(200).json({
      data: {
        user: {
          ...existUser.value,
        },
        auth: {
          token,
          expire_in: new Date().getTime() + 3 * 60 * 60 * 1000, // 3h
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

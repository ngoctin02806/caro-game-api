const shortid = require('shortid');

const { onSendEmailEvent } = require('../event/onSendEmail.event');
const httpErrorsHelper = require('../lib/httpErrorsHelper');
const userService = require('../app/services/user.service');

module.exports = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const user = await userService.getUserById(_id);

    if (user.value instanceof Error) throw user.value;

    if (!user.value.is_verified) {
      const verifiedCode = shortid.generate();

      const result = await userService.updateVerifiedCode(
        user.value._id, // eslint-disable-line
        verifiedCode
      );

      if (result.value instanceof Error) throw result.value;

      onSendEmailEvent.next({
        email: user.value.email,
        verified_code: verifiedCode,
      });

      return res.status(400).json(httpErrorsHelper.userDoesNotValidateEmail());
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

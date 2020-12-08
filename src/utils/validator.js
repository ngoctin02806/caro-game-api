const Ajv = require('ajv');

const httpErrorsHelper = require('../lib/httpErrorsHelper');

module.exports = schema => (req, res, next) => {
  const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
    errorDataPath: true,
  });

  const valid = ajv.addSchema(schema, 'body').validate('body', req.body);
  if (!valid) {
    const errors = ajv.errors.map(error => {
      return error.message;
    });
    return res.status(400).json(httpErrorsHelper.badRequest(errors));
  }
  return next();
};

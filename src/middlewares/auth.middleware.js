const jwtHelper = require('../lib/jwtHelper');
const httpReponseErrors = require('../lib/httpErrorsHelper');

module.exports = async (req, res, next) => {
  try {
    const token = req.get('x-auth-token');

    if (!token) return res.status(401).json(httpReponseErrors.unauthorized());

    const decodedToken = await jwtHelper.verifyToken(token);

    req.user = decodedToken;

    return next();
  } catch (error) {
    return res.status(401).json(httpReponseErrors.unauthorized());
  }
};

const jwtHelper = require('../lib/jwtHelper');
const httpReponseErrors = require('../lib/httpErrorsHelper');

module.exports = async (req, res, next) => {
  try {
    const token = req.get('x-auth-token');

    if (!token) return res.status(401).json(httpReponseErrors.unauthorized());

    const decodedToken = await jwtHelper.verifyToken(token);

    // eslint-disable-next-line
    if (decodedToken._role === 'ADMIN') {
      req.user = decodedToken;
      return next();
    }
    return res.status(401).json(httpReponseErrors.adminUnauthorized());
  } catch (error) {
    return res.status(401).json(httpReponseErrors.unauthorized());
  }
};

const db = require('../../database/models');

module.exports.getAttribute = async (req, res, next) => {
  try {
    const attrs = await db.Attribute.findAndCountAll();

    return res.status(200).json(attrs);
  } catch (error) {
    return next(error);
  }
};

const statisticSrv = require('../services/statistic.service');

module.exports.getRanking = async (req, res, next) => {
  try {
    const stats = await statisticSrv.aggregateRankingTop();

    if (stats.value instanceof Error) throw stats.value;

    return res.status(200).json({
      top_rankings: stats.value,
    });
  } catch (error) {
    return next(error);
  }
};

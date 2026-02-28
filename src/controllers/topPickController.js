const topPickService = require('../services/topPickService');
const apiResponse = require('../utils/apiResponse');

class TopPickController {

    // GET /api/top-picks
    async getTopPicks(req, res) {
        try {
            const userId = req.user.id;
            const picks = await topPickService.getTopPicks(userId);
            return apiResponse.success(res, 'Top picks retrieved successfully', {
                totalPicks: picks.length,
                picks
            });
        } catch (error) {
            return apiResponse.error(res, error.message);
        }
    }

    // POST /api/top-picks/generate
    async generateTopPicks(req, res) {
        try {
            const userId = req.user.id;
            const count = req.body.count ? parseInt(req.body.count) : 10;
            const result = await topPickService.generateTopPicks(userId, count);
            return apiResponse.success(res, result.message, { count: result.count });
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }
}

module.exports = new TopPickController();

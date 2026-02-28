const matchCriteriaService = require('../services/matchCriteriaService');
const apiResponse = require('../utils/apiResponse');

class MatchCriteriaController {

    // GET /api/match-criteria
    async getCriteria(req, res) {
        try {
            const userId = req.user.id;
            const criteria = await matchCriteriaService.getCriteria(userId);
            return apiResponse.success(res, 'Match criteria retrieved successfully', criteria);
        } catch (error) {
            return apiResponse.error(res, error.message);
        }
    }

    // PUT /api/match-criteria
    async setCriteria(req, res) {
        try {
            const userId = req.user.id;
            const criteria = await matchCriteriaService.setCriteria(userId, req.body);
            return apiResponse.success(res, 'Match criteria updated successfully', criteria);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // DELETE /api/match-criteria
    async resetCriteria(req, res) {
        try {
            const userId = req.user.id;
            const result = await matchCriteriaService.resetCriteria(userId);
            return apiResponse.success(res, result.message);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }
}

module.exports = new MatchCriteriaController();

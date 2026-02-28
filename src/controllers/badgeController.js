const badgeService = require('../services/badgeService');
const apiResponse = require('../utils/apiResponse');

class BadgeController {

    // GET /api/badges
    async getAllBadges(req, res) {
        try {
            const badges = await badgeService.getAllBadges();
            return apiResponse.success(res, 'Badges retrieved successfully', badges);
        } catch (error) {
            return apiResponse.error(res, error.message);
        }
    }

    // GET /api/badges/:id
    async getBadgeById(req, res) {
        try {
            const badge = await badgeService.getBadgeById(parseInt(req.params.id));
            return apiResponse.success(res, 'Badge retrieved successfully', badge);
        } catch (error) {
            return apiResponse.error(res, error.message, 404);
        }
    }

    // POST /api/badges
    async createBadge(req, res) {
        try {
            const badge = await badgeService.createBadge(req.body);
            return apiResponse.success(res, 'Badge created successfully', badge, 201);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // PUT /api/badges/:id
    async updateBadge(req, res) {
        try {
            const badge = await badgeService.updateBadge(parseInt(req.params.id), req.body);
            return apiResponse.success(res, 'Badge updated successfully', badge);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // DELETE /api/badges/:id
    async deleteBadge(req, res) {
        try {
            const result = await badgeService.deleteBadge(parseInt(req.params.id));
            return apiResponse.success(res, result.message);
        } catch (error) {
            return apiResponse.error(res, error.message, 404);
        }
    }

    // POST /api/users/:userId/badges
    async assignBadge(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const { badgeId } = req.body;

            if (!badgeId) {
                return apiResponse.error(res, 'badgeId is required', 400);
            }

            const result = await badgeService.assignBadge(userId, parseInt(badgeId));
            return apiResponse.success(res, result.message, result.userBadge, 201);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // DELETE /api/users/:userId/badges/:badgeId
    async removeBadge(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const badgeId = parseInt(req.params.badgeId);
            const result = await badgeService.removeBadge(userId, badgeId);
            return apiResponse.success(res, result.message);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // GET /api/users/:userId/badges
    async getUserBadges(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const badges = await badgeService.getUserBadges(userId);
            return apiResponse.success(res, 'User badges retrieved successfully', badges);
        } catch (error) {
            return apiResponse.error(res, error.message);
        }
    }
}

module.exports = new BadgeController();

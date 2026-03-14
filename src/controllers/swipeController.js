const swipeService = require('../services/swipeService');
const apiResponse = require('../utils/apiResponse');

class SwipeController {

  // GET /api/swipes/history
  async getSwipeHistory(req, res) {
    try {
      const userId = req.user.id;
      const result = await swipeService.getSwipeHistory(userId, req.query);
      return apiResponse.success(res, 'Swipe history retrieved successfully', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }
}

module.exports = new SwipeController();

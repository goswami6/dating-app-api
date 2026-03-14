const discoveryService = require('../services/discoveryService');
const apiResponse = require('../utils/apiResponse');

class DiscoveryController {

  // GET /api/discovery/users
  async getDiscoverableUsers(req, res) {
    try {
      const userId = req.user.id;
      const result = await discoveryService.getDiscoverableUsers(userId, req.query);
      return apiResponse.success(res, 'Discovery profiles retrieved successfully', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // POST /api/discovery/location
  async updateLocation(req, res) {
    try {
      const userId = req.user.id;
      const { location, latitude, longitude } = req.body;
      const result = await discoveryService.updateLocation(userId, location, latitude, longitude);
      return apiResponse.success(res, 'Location updated successfully', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // GET /api/discovery/settings
  async getSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await discoveryService.getDiscoverySettings(userId);
      return apiResponse.success(res, 'Discovery settings retrieved successfully', settings);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // PUT /api/discovery/settings
  async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await discoveryService.updateDiscoverySettings(userId, req.body);
      return apiResponse.success(res, 'Discovery settings updated successfully', settings);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new DiscoveryController();

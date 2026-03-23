const shopAddressService = require('../services/shopAddressService');
const apiResponse = require('../utils/apiResponse');

class ShopAddressController {
  async getAll(req, res) {
    try {
      const addresses = await shopAddressService.getAddresses(req.user.id);
      return apiResponse.success(res, 'Addresses retrieved', { addresses });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const address = await shopAddressService.getAddressById(req.user.id, parseInt(req.params.id));
      return apiResponse.success(res, 'Address retrieved', { address });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async create(req, res) {
    try {
      const address = await shopAddressService.createAddress(req.user.id, req.body);
      return apiResponse.success(res, 'Address created', { address }, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const address = await shopAddressService.updateAddress(req.user.id, parseInt(req.params.id), req.body);
      return apiResponse.success(res, 'Address updated', { address });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const result = await shopAddressService.deleteAddress(req.user.id, parseInt(req.params.id));
      return apiResponse.success(res, result.message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async setDefault(req, res) {
    try {
      const address = await shopAddressService.setDefault(req.user.id, parseInt(req.params.id));
      return apiResponse.success(res, 'Default address set', { address });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new ShopAddressController();

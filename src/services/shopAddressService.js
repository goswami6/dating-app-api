const shopAddressRepository = require('../repositories/shopAddressRepository');

class ShopAddressService {
  async getAddresses(userId) {
    return await shopAddressRepository.findByUser(userId);
  }

  async getAddressById(userId, id) {
    const addr = await shopAddressRepository.findById(id, userId);
    if (!addr) throw new Error('Address not found');
    return addr;
  }

  async createAddress(userId, data) {
    data.userId = userId;
    return await shopAddressRepository.create(data);
  }

  async updateAddress(userId, id, data) {
    const addr = await shopAddressRepository.update(id, userId, data);
    if (!addr) throw new Error('Address not found');
    return addr;
  }

  async deleteAddress(userId, id) {
    const result = await shopAddressRepository.delete(id, userId);
    if (!result) throw new Error('Address not found');
    return { message: 'Address deleted' };
  }

  async setDefault(userId, id) {
    return await this.updateAddress(userId, id, { isDefault: true });
  }
}

module.exports = new ShopAddressService();

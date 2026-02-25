const { User } = require('../models');

class UserRepository {
    async findAll(options = {}) {
        return await User.findAll(options);
    }

    async findById(id) {
        return await User.findByPk(id);
    }

    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    async findByPhone(phoneNumber) {
        return await User.findOne({ where: { phoneNumber } });
    }

    async findOne(where) {
        return await User.findOne({ where });
    }

    async create(data) {
        return await User.create(data);
    }

    async update(id, data) {
        const user = await User.findByPk(id);
        if (!user) return null;
        return await user.update(data);
    }

    async delete(id) {
        const user = await User.findByPk(id);
        if (!user) return null;
        await user.destroy();
        return true;
    }

    async updateOtp(id, otp, otpExpiry) {
        return await this.update(id, { otp, otpExpiry, otpVerified: false });
    }

    async verifyOtp(id) {
        return await this.update(id, { otp: null, otpExpiry: null, otpVerified: true, isVerified: true });
    }

    async updateAccountStatus(id, status) {
        return await this.update(id, { accountStatus: status });
    }

    async count(where = {}) {
        return await User.count({ where });
    }
}

module.exports = new UserRepository();

const { User, UserPhoto } = require('../models');

class UserRepository {
    async findAll(options = {}) {
        const where = { isAdmin: false, ...(options.where || {}) };
        return await User.findAll({
            ...options,
            where,
            include: [{ model: UserPhoto, as: 'Photos', order: [['sortOrder', 'ASC']] }],
        });
    }

    async findById(id) {
        return await User.findOne({
            where: { id, isAdmin: false },
            include: [{ model: UserPhoto, as: 'Photos', order: [['sortOrder', 'ASC']] }],
        });
    }

    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    async findByPhone(phoneNumber) {
        return await User.findOne({ where: { phoneNumber } });
    }

    async findOne(where) {
        return await User.findOne({ where: { ...where, isAdmin: false } });
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

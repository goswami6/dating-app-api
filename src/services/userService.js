const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class UserService {

    // ── Create ──────────────────────────────────────────────
    async createUser(data) {
        // Check duplicate email
        const existingEmail = await userRepository.findByEmail(data.email);
        if (existingEmail) throw new Error('Email already registered');

        // Check duplicate phone
        if (data.phoneNumber) {
            const existingPhone = await userRepository.findByPhone(data.phoneNumber);
            if (existingPhone) throw new Error('Phone number already registered');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        data.passwordHash = await bcrypt.hash(data.passwordHash, salt);

        const user = await userRepository.create(data);
        return this._sanitize(user);
    }

    // ── Read ────────────────────────────────────────────────
    async getAllUsers() {
        const users = await userRepository.findAll();
        return users.map(u => this._sanitize(u));
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) throw new Error('User not found');
        return this._sanitize(user);
    }

    async getUserByEmail(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error('User not found');
        return user; // Return full object (used internally for auth)
    }

    // ── Update ──────────────────────────────────────────────
    async updateUser(id, data) {
        // Prevent email change to an already-taken email
        if (data.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing && existing.id !== id) throw new Error('Email already in use');
        }

        // Prevent phone change to an already-taken phone
        if (data.phoneNumber) {
            const existing = await userRepository.findByPhone(data.phoneNumber);
            if (existing && existing.id !== id) throw new Error('Phone number already in use');
        }

        // Hash password if being updated
        if (data.passwordHash) {
            const salt = await bcrypt.genSalt(10);
            data.passwordHash = await bcrypt.hash(data.passwordHash, salt);
        }

        const user = await userRepository.update(id, data);
        if (!user) throw new Error('User not found');
        return this._sanitize(user);
    }

    // ── Delete ──────────────────────────────────────────────
    async deleteUser(id) {
        const result = await userRepository.delete(id);
        if (!result) throw new Error('User not found');
        return { message: 'User deleted successfully' };
    }

    // ── Account Status ──────────────────────────────────────
    async activateAccount(id) {
        const user = await userRepository.updateAccountStatus(id, 'active');
        if (!user) throw new Error('User not found');
        return this._sanitize(user);
    }

    async suspendAccount(id) {
        const user = await userRepository.updateAccountStatus(id, 'suspended');
        if (!user) throw new Error('User not found');
        return this._sanitize(user);
    }

    // ── Password ────────────────────────────────────────────
    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // ── Helper ──────────────────────────────────────────────
    _sanitize(user) {
        const { passwordHash, otp, otpExpiry, ...safe } = user.toJSON();
        return safe;
    }

    // ── Full Profile (with photos) ──────────────────────────
    async getFullProfile(id) {
        const user = await userRepository.findById(id);
        if (!user) throw new Error('User not found');
        return this._sanitize(user);
    }
}

module.exports = new UserService();

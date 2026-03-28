const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('./emailService');

class AuthService {

    // ── Login with Password ─────────────────────────────────
    async login(email, password) {
        // Find user by email (full object including passwordHash)
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error('Invalid email or password');

        // Check account status
        // if (user.accountStatus === 'suspended') throw new Error('Account is suspended');
        if (user.accountStatus === 'deleted') throw new Error('Account has been deleted');

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) throw new Error('Invalid email or password');

        // Generate JWT token
        const token = this._generateToken(user);

        // Sanitize user data
        const { passwordHash, otp, otpExpiry, ...safeUser } = user.toJSON();

        if (user.accountStatus === 'suspended'){
            await userRepository.update(user.id, { accountStatus: 'active'});
            safeUser.accountStatus = 'active';
        }

        return {
            token,
            user: safeUser,
        };
    }

    // ── Request OTP Login ───────────────────────────────────
    async requestOtpLogin(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error('No account found with this email');
        if (user.accountStatus === 'deleted') throw new Error('Account has been deleted');

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user
        await userRepository.updateOtp(user.id, otp, otpExpiry);

        // Send OTP via email (await to catch delivery errors)
        try {
            await emailService.sendOtpEmail(user.email, otp, user.firstName);
        } catch (emailErr) {
            console.error('❌ RESEND ERROR (full):', emailErr);
            console.error('❌ RESEND ERROR message:', emailErr.message);
            console.error('❌ RESEND ERROR response:', JSON.stringify(emailErr.response || emailErr.data || {}, null, 2));
            throw new Error('OTP generated but failed to send email. Please try again.');
        }

        return { message: 'OTP sent to your email' };
    }

    // ── Verify OTP and Login ────────────────────────────────
    async verifyOtpLogin(email, otp) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error('No account found with this email');
        if (user.accountStatus === 'deleted') throw new Error('Account has been deleted');

        // Validate OTP
        if (!user.otp) throw new Error('No OTP requested. Please request a new OTP.');
        if (new Date() > new Date(user.otpExpiry)) throw new Error('OTP has expired. Please request a new one.');
        if (user.otp !== otp) throw new Error('Invalid OTP');

        // Clear OTP and mark verified
        await userRepository.verifyOtp(user.id);

        // Reactivate if suspended
        if (user.accountStatus === 'suspended') {
            await userRepository.update(user.id, { accountStatus: 'active' });
        }

        // Generate JWT token
        const token = this._generateToken(user);

        // Sanitize user data
        const { passwordHash, otp: _otp, otpExpiry, ...safeUser } = user.toJSON();
        safeUser.isVerified = true;
        safeUser.otpVerified = true;
        if (user.accountStatus === 'suspended') {
            safeUser.accountStatus = 'active';
        }

        return {
            token,
            user: safeUser,
        };
    }

    // ── Forgot Password (Request OTP) ────────────────────
    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error('No account found with this email');
        if (user.accountStatus === 'deleted') throw new Error('Account has been deleted');

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user
        await userRepository.updateOtp(user.id, otp, otpExpiry);

        // Send OTP via email
        await emailService.sendOtpEmail(user.email, otp, user.firstName);

        return { message: 'Password reset OTP sent to your email' };
    }

    // ── Reset Password (Verify OTP + New Password) ──────────
    async resetPassword(email, otp, newPassword) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error('No account found with this email');
        if (user.accountStatus === 'deleted') throw new Error('Account has been deleted');

        // Validate OTP
        if (!user.otp) throw new Error('No OTP requested. Please request a new OTP.');
        if (new Date() > new Date(user.otpExpiry)) throw new Error('OTP has expired. Please request a new one.');
        if (user.otp !== otp) throw new Error('Invalid OTP');

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP
        await userRepository.update(user.id, {
            passwordHash,
            otp: null,
            otpExpiry: null,
            otpVerified: true,
            isVerified: true
        });

        return { message: 'Password reset successfully' };
    }

    // ── Token Generation ────────────────────────────────────
    _generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            accountStatus: user.accountStatus,
            isAdmin: user.isAdmin || false,
        };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
    }

    // ── Token Verification ──────────────────────────────────
    verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
}

module.exports = new AuthService();

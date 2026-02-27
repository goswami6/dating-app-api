const nodemailer = require('nodemailer');

class EmailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
            pool: true,           // reuse connections
            maxConnections: 3,    // keep up to 3 connections
            maxMessages: 100,     // messages per connection before reconnecting
        });

        // Warm up SMTP connection on startup
        this.transporter.verify().then(() => {
            console.log('✅ SMTP server connected and ready');
        }).catch(err => {
            console.error('⚠️  SMTP connection warning:', err.message);
        });
    }

    // ── Send Email ──────────────────────────────────────────
    async sendEmail(to, subject, html) {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        try {
            return await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('❌ Email send error:', error.message);
            throw new Error('Failed to send email. Please try again later.');
        }
    }

    // ── Send OTP Email ──────────────────────────────────────
    async sendOtpEmail(to, otp, firstName = 'User') {
        const subject = 'Your Login OTP - Dating App';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #e91e63; text-align: center;">💕 Dating App</h2>
                <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center;">
                    <p style="font-size: 16px; color: #333;">Hi <strong>${firstName}</strong>,</p>
                    <p style="font-size: 14px; color: #666;">Your one-time login code is:</p>
                    <div style="background: #e91e63; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; display: inline-block; margin: 15px 0;">
                        ${otp}
                    </div>
                    <p style="font-size: 13px; color: #999; margin-top: 20px;">
                        This code expires in <strong>10 minutes</strong>.<br>
                        Do not share this code with anyone.
                    </p>
                </div>
                <p style="font-size: 12px; color: #bbb; text-align: center; margin-top: 20px;">
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
        `;

        return await this.sendEmail(to, subject, html);
    }
}

module.exports = new EmailService();

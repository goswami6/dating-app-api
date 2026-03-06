const { Resend } = require('resend');

class EmailService {

    constructor() {
        this.apiKey = process.env.RESEND_API_KEY;
        this.fromAddress = `${process.env.EMAIL_FROM_NAME || 'Dating App'} <${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'}>`;

        if (!this.apiKey) {
            console.error('⚠️  RESEND_API_KEY is not set — email sending will be disabled');
            this.resend = null;
        } else {
            this.resend = new Resend(this.apiKey);
            console.log('✅ Resend email service initialized (HTTPS API)');
        }
    }

    // ── Send Email ──────────────────────────────────────────
    async sendEmail(to, subject, html) {
        if (!this.resend) {
            throw new Error('Email service not configured. RESEND_API_KEY is missing.');
        }

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.fromAddress,
                to,
                subject,
                html,
            });

            if (error) {
                console.error('❌ Resend API error:', JSON.stringify(error));
                throw new Error(`Resend error: ${error.message || error.name}`);
            }

            console.log('✅ Email sent via Resend:', data?.id);
            return data;
        } catch (error) {
            console.error('❌ Email send error (full):', error);
            console.error('❌ Email send error message:', error.message);
            throw error;
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

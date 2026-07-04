const nodemailer = require("nodemailer");
const settings = require("../config/settings");

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: settings.SMTP_HOST,
            port: settings.SMTP_PORT,
            secure: settings.SMTP_PORT === 465, // true for 465, false for other ports
            auth: settings.SMTP_USER && settings.SMTP_PASS ? {
                user: settings.SMTP_USER,
                pass: settings.SMTP_PASS,
            } : undefined,
        });
    }

    /**
     * Sends an email
     * @param {Object} options
     * @param {string} options.to
     * @param {string} options.subject
     * @param {string} [options.text]
     * @param {string} [options.html]
     */
    async sendMail({ to, subject, text, html }) {
        const mailOptions = {
            from: settings.SMTP_FROM,
            to,
            subject,
            text,
            html,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error("Failed to send email", error);
            throw new Error(`Email delivery failed: ${error.message}`);
        }
    }

    /**
     * Sends verification code email
     * @param {string} email 
     * @param {string} code 
     */
    async sendVerificationEmail(email, code) {
        const subject = `${settings.APP_NAME || "Online Judge"} - Verify Your Email`;
        const text = `Your verification code is: ${code}. It expires in 10 minutes.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome to ${settings.APP_NAME || "Online Judge"}!</h2>
                <p>Thank you for registering. Please verify your email address by using the following verification code:</p>
                <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f0f0f0; display: inline-block; letter-spacing: 2px;">
                    ${code}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `;

        return this.sendMail({ to: email, subject, text, html });
    }
}

module.exports = new MailService();

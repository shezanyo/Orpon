const nodemailer = require("nodemailer");

/**
 * Sends a password reset email using Nodemailer.
 * If SMTP configuration is missing, logs the reset link to the console for local development.
 * 
 * @param {string} toEmail - Recipient email
 * @param {string} resetLink - The secure password reset link
 * @returns {Promise<{success: boolean, simulated: boolean}>}
 */
const sendResetEmail = async (toEmail, resetLink) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    // Check if configuration is present
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
        console.warn("\n============================================================");
        console.warn("✉️  [SIMULATED EMAIL SERVICE] SMTP config not set.");
        console.warn(`👉 To: ${toEmail}`);
        console.warn(`🔗 Reset Password Link: ${resetLink}`);
        console.warn("============================================================\n");
        return { success: true, simulated: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT, 10) || 587,
            secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"${SMTP_FROM.split("@")[0]}" <${SMTP_FROM}>`,
            to: toEmail,
            subject: "Reset Your Orpon Password",
            text: `You requested a password reset. Please click the following link to reset your password: ${resetLink}\n\nIf you did not request this, please ignore this email. This link will expire in 15 minutes.`,
            html: `
                <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EDE9E0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #1B4332; margin: 0; font-size: 28px; font-weight: 800;">অ Orpon</h2>
                        <p style="color: #888888; font-size: 14px; margin: 4px 0 0 0;">Transparent & Secured Crowdfunding</p>
                    </div>
                    <div style="background-color: #F8F6F0; border-radius: 8px; padding: 24px; color: #1A1A2E; margin-bottom: 24px;">
                        <h3 style="margin-top: 0; color: #1B4332; font-size: 18px;">Password Reset Request</h3>
                        <p style="font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
                            We received a request to reset the password associated with your account (${toEmail}). 
                            Please click the button below to set a new password:
                        </p>
                        <div style="text-align: center; margin: 28px 0;">
                            <a href="${resetLink}" target="_blank" style="background-color: #1B4332; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="font-size: 12px; color: #666666; line-height: 1.5; margin-top: 24px;">
                            If the button doesn't work, copy and paste this URL into your browser:<br>
                            <a href="${resetLink}" style="color: #2D6A4F; word-break: break-all;">${resetLink}</a>
                        </p>
                    </div>
                    <div style="text-align: center; color: #999999; font-size: 12px;">
                        <p>This reset link will expire in 15 minutes.</p>
                        <p>If you did not request a password reset, please ignore this email.</p>
                        <p style="margin-top: 16px;">&copy; ${new Date().getFullYear()} Orpon. All rights reserved.</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️  [SMTP] Password reset email sent to ${toEmail}. Message ID: ${info.messageId}`);
        return { success: true, simulated: false };
    } catch (error) {
        console.error(`❌ [SMTP ERROR] Failed to send email to ${toEmail}:`, error);
        throw error;
    }
};

module.exports = { sendResetEmail };

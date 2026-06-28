/**
 * Email Service
 * Sends password reset OTP via nodemailer.
 * Falls back to console.log if SMTP is not configured.
 */

let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter;

  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[EmailService] SMTP not configured — emails will be logged to console.');
    return null;
  }

  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transporter;
  } catch (err) {
    console.error('[EmailService] Failed to init transporter:', err.message);
    return null;
  }
};

/**
 * Send password reset OTP email
 * @param {string} toEmail - recipient email
 * @param {string} otp - 6-digit OTP (plain text)
 * @param {string} userName - recipient's name
 */
const sendPasswordResetEmail = async (toEmail, otp, userName = 'User') => {
  const appName = 'FirstCry Intellitots';
  const expiryMins = 15;

  const subject = `${appName} — Password Reset OTP`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 16px;">
      <h2 style="color: #4f46e5; margin-bottom: 8px;">🔐 Password Reset</h2>
      <p style="color: #374151;">Hello <strong>${userName}</strong>,</p>
      <p style="color: #374151;">We received a request to reset your password on <strong>${appName}</strong>.</p>
      <p style="color: #374151;">Your One-Time Password (OTP) is:</p>
      <div style="background: #4f46e5; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 12px; margin: 24px 0;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 14px;">⏰ This OTP expires in <strong>${expiryMins} minutes</strong>.</p>
      <p style="color: #6b7280; font-size: 14px;">If you did not request this, please ignore this email. Your account remains secure.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">— The ${appName} Team</p>
    </div>
  `;

  const mailer = initTransporter();

  if (!mailer) {
    // Console fallback for development
    console.log('\n========================================');
    console.log(`📧 [EMAIL FALLBACK] To: ${toEmail}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 OTP for ${userName}: \x1b[33m${otp}\x1b[0m`);
    console.log(`📧 Expires in: ${expiryMins} minutes`);
    console.log('========================================\n');
    return true;
  }

  await mailer.sendMail({
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    html: htmlBody,
  });

  return true;
};

module.exports = { sendPasswordResetEmail };

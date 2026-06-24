const nodemailer = require('nodemailer');

/**
 * Creates a reusable Nodemailer transporter using SMTP credentials from .env
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Sends an email. Throws on failure so callers can decide how to handle it.
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} html
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

const otpEmailTemplate = (name, otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
    <h2 style="color:#1d4ed8;">BuildTrack Email Verification</h2>
    <p>Hi ${name},</p>
    <p>Your One-Time Password (OTP) for verifying your BuildTrack account is:</p>
    <h1 style="letter-spacing:4px;">${otp}</h1>
    <p>This OTP will expire in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`;

const resetPasswordEmailTemplate = (name, resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
    <h2 style="color:#1d4ed8;">Reset Your BuildTrack Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to proceed:</p>
    <p><a href="${resetUrl}" style="background:#1d4ed8;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
    <p>This link will expire in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

module.exports = { sendEmail, otpEmailTemplate, resetPasswordEmailTemplate };

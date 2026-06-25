/**
 * Email sending.
 *
 * Primary path: Resend (https://resend.com) — sends over plain HTTPS, which
 * works reliably on PaaS providers like Render. SMTP ports (587/465) are
 * often blocked or heavily throttled on free-tier hosting, which causes
 * Gmail SMTP to hang and eventually time out in production.
 *
 * Fallback path: Nodemailer/SMTP — used automatically if RESEND_API_KEY is
 * not set, so local development can keep using a Gmail App Password without
 * any extra signup. Once RESEND_API_KEY is set (recommended for production),
 * Resend is used automatically instead.
 */
const nodemailer = require('nodemailer');

const usingResend = !!process.env.RESEND_API_KEY;

let resendClient;
if (usingResend) {
  const { Resend } = require('resend');
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

const createSmtpTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // fail fast (10s) instead of hanging for minutes
  });

/**
 * Sends an email via Resend if configured, otherwise falls back to SMTP.
 * Throws on failure so callers can decide how to handle it.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (usingResend) {
    const { error } = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'BuildTrack <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message || 'Resend failed to send email');
    return;
  }

  const transporter = createSmtpTransporter();
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

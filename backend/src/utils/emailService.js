const nodemailer = require('nodemailer');

/**
 * Sends an email using SMTP settings from environment variables.
 *
 * Required env vars:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - EMAIL_FROM
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST not configured; skipping email send.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };



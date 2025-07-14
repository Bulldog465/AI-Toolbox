import nodemailer from 'nodemailer';

export const emailConfig = {
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  service: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,  // Add port configuration for Gmail
};

const transporter = nodemailer.createTransport(emailConfig);

export const sendMail = async ({ from, html, subject, text, to }) => {
  const data = {
    from: from ?? process.env.EMAIL_FROM,  // Default to EMAIL_FROM from .env
    to,
    subject,
    text,
    html,
  };

  // In production, send the email; otherwise, log it
  if (process.env.NODE_ENV === 'production') {
    await transporter.sendMail(data);
  } else {
    console.log(data);
  }
};

export default transporter;

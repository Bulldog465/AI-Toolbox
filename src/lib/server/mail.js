import nodemailer from 'nodemailer';

// Nodemailer SMTP transporter configuration
export const emailConfig = {
  host: process.env.EMAIL_SERVICE || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true if port 465, false otherwise
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

// Send an email
export const sendMail = async ({ from, to, subject, text, html }) => {
  const mailOptions = {
    from: from ?? process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  try {
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } else {
      console.log('Development Mode - Email Data:', mailOptions);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export default transporter;

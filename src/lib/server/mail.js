import nodemailer from 'nodemailer';

// Nodemailer SMTP transporter configuration
export const emailConfig = {
  host: process.env.EMAIL_SERVER || 'smtp.zoho.com', // Correct env var
  port: Number(process.env.EMAIL_SERVER_PORT) || 465, // Default to SSL port 465
  secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // Enable SSL for port 465
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
      console.log(`✅ Email sent to ${to}`);
    } else {
      console.log('📧 Development Mode - Email Preview:', mailOptions);
    }
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

export default transporter;

import nodemailer from 'nodemailer';

// Define email configuration using environment variables
export const emailConfig = {
  auth: {
    user: process.env.EMAIL_SERVER_USER,  // Use environment variable for email user
    pass: process.env.EMAIL_SERVER_PASSWORD,  // Use environment variable for password
  },
  service: process.env.EMAIL_SERVICE,  // Use environment variable for email service (e.g., smtp.gmail.com)
};

// Create the transporter using the defined configuration
const transporter = nodemailer.createTransport(emailConfig);

// Function to send an email
export const sendMail = async ({ from, html, subject, text, to }) => {
  const data = {
    from: from ?? process.env.EMAIL_FROM,  // Use email from environment variable if 'from' is not provided
    to,
    subject,
    text,
    html,
  };

  // Only send the email in production environment
  if (process.env.NODE_ENV === 'production') {
    await transporter.sendMail(data);
  } else {
    console.log(data);  // In development, log the data instead of sending
  }
};

export default transporter;

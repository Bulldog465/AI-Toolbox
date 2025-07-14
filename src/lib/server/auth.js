import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import prisma from '@/prisma/index';  // Your Prisma client
import { sendMail } from '@/lib/server/mail';  // Import the sendMail function
import { html, text } from '@/config/email-templates/signin';  // Import your HTML and text email templates
import { getPayment, createPaymentAccount } from '@/prisma/services/customer';  // Import your custom payment functions

export const authOptions = {
  // Prisma Adapter for user management
  adapter: PrismaAdapter(prisma),

  // Callbacks for session management
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        const customerPayment = await getPayment(user.email);
        session.user.userId = user.id;

        // Attach subscription type to session if available
        if (customerPayment) {
          session.user.subscription = customerPayment.subscriptionType;
        }
      }

      return session;
    },
  },

  // Debugging in non-production environments
  debug: process.env.NODE_ENV !== 'production',  // Ensures debugging only happens in non-production environments

  // Events triggered on certain actions (e.g., on sign-in)
  events: {
    signIn: async ({ user, isNewUser }) => {
      const customerPayment = await getPayment(user.email);

      // If the user is new or if payment account details are missing, create a new payment account
      if (isNewUser || customerPayment === null || user.createdAt === null) {
        await Promise.all([createPaymentAccount(user.email, user.id)]);
      }
    },
  },

  // Providers array for authentication
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,  // Sender email address from .env
      server: {
        host: process.env.EMAIL_SERVER_HOST,  // Use the SMTP host from .env
        port: process.env.EMAIL_SERVER_PORT,  // Use the SMTP port from .env
        auth: {
          user: process.env.EMAIL_SERVER_USER,  // Email service user from .env
          pass: process.env.EMAIL_SERVER_PASSWORD,  // Email service password from .env
        },
      },
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { host } = new URL(url);

        // Use your existing sendMail function to send the magic link email
        await sendMail({
          from: process.env.EMAIL_FROM,  // Use the email address from environment
          to: email,  // Recipient email
          subject: `[Nextacular] Sign in to ${host}`,
          text: text({ email, url }),  // Use the text template
          html: html({ email, url }),  // Use the HTML template
        });
      },
    }),
  ],

  // Secret for NextAuth session management
  secret: process.env.NEXTAUTH_SECRET || null,

  // Session configuration using JWT
  session: {
    jwt: true,
  },
};

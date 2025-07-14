// lib/server/auth.js
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import prisma from '@/prisma/index';
import { sendMail } from '@/lib/server/mail';  // Import sendMail function
import { html, text } from '@/config/email-templates/signin';  // Use your HTML and text email templates

export const authOptions = {
  // Prisma Adapter for user management
  adapter: PrismaAdapter(prisma),

  // Callbacks for session management
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        const customerPayment = await getPayment(user.email);
        session.user.userId = user.id;

        if (customerPayment) {
          session.user.subscription = customerPayment.subscriptionType;
        }
      }

      return session;
    },
  },

  // Debugging in non-production environments
  debug: !(process.env.NODE_ENV === 'production'),

  // Events triggered on certain actions (e.g., on sign-in)
  events: {
    signIn: async ({ user, isNewUser }) => {
      const customerPayment = await getPayment(user.email);

      if (isNewUser || customerPayment === null || user.createdAt === null) {
        await Promise.all([createPaymentAccount(user.email, user.id)]);
      }
    },
  },

  // Providers array for authentication
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,  // Sender email
      server: emailServiceConfig,  // Your SMTP server details from .env
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { host } = new URL(url);

        // Use your existing sendMail function to send the magic link email
        await sendMail({
          from: process.env.EMAIL_FROM,  // Use the email address from environment
          to: email,  // Recipient email
          subject: `[Nextacular] Sign in to ${host}`,
          text: text({ email, url }),  // Use your text template
          html: html({ email, url }),  // Use your HTML template
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

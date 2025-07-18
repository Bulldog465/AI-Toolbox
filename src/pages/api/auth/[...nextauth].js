import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Ensure Prisma Client is connected and ready to handle requests
prisma.$connect()
    .catch(e => {
        console.error('Prisma connection error:', e);
    });

export default NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVICE,
                port: Number(process.env.EMAIL_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login', // Custom login page
    },
    session: {
        jwt: true, // Using JWT for session management (optional based on your setup)
    },
    callbacks: {
        async session({ session, user }) {
            // Optional: Enhance the session with additional data
            session.user.id = user.id;
            return session;
        },
    },
    debug: process.env.NODE_ENV === 'development', // Log debug info in development
});

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const main = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL is not set in environment variables.');
  }

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail },
  });

  console.info('Admin user created or updated:', user);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

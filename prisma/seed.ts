import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;
  const name = process.env.SEED_NAME ?? 'Admin';

  if (!email || !password) {
    console.log('No SEED_EMAIL / SEED_PASSWORD set, skipping seed.');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists, skipping.`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, password: hash, name } });
  console.log(`Created user: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

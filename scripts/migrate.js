// Runs at startup to apply schema additions idempotently.
// Uses PrismaClient directly so it shares the exact same DB connection
// as the app — if the app can reach the DB, this will too.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true`
  );
  console.log('Person.active: ok');

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "company" TEXT`
  );
  console.log('Person.company: ok');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PasswordReset" (
      "id" SERIAL PRIMARY KEY,
      "token" TEXT NOT NULL UNIQUE,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "usedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "PasswordReset_userId_idx" ON "PasswordReset"("userId")`
  );
  console.log('PasswordReset: ok');
}

main()
  .then(() => {
    console.log('Schema additions complete.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Schema additions failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

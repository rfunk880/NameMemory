#!/bin/sh

echo "=== NameMemory startup ==="

# Apply schema additions via direct SQL with IF NOT EXISTS guards.
# We avoid migrate deploy (fails on this DB — no migration baseline) and
# db push (refuses when any migration is recorded as failed, which happens
# because the init migration tries to CREATE tables that already exist).
# Each db execute call is a standalone statement matching the pattern that
# was proven to work in earlier deployments.

echo "Ensuring Person.active column exists..."
node node_modules/prisma/build/index.js db execute --stdin <<'SQL' || echo "(active column ensure failed, continuing)"
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
SQL

echo "Ensuring Person.company column exists..."
node node_modules/prisma/build/index.js db execute --stdin <<'SQL' || echo "(company column ensure failed, continuing)"
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "company" TEXT;
SQL

echo "Ensuring PasswordReset table exists..."
node node_modules/prisma/build/index.js db execute --stdin <<'SQL' || echo "(PasswordReset ensure failed, continuing)"
CREATE TABLE IF NOT EXISTS "PasswordReset" (
  "id" SERIAL PRIMARY KEY,
  "token" TEXT NOT NULL UNIQUE,
  "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "PasswordReset_userId_idx" ON "PasswordReset"("userId");
SQL

echo "Starting Next.js..."
exec node server.js

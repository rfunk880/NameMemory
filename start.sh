#!/bin/sh

echo "=== NameMemory startup ==="

# Apply all schema additions idempotently via raw SQL.
# We avoid `migrate deploy` (it fails on this DB which was bootstrapped via
# `db push` and has no migration baseline) and `db push` (it refuses to run
# when any prior migration is recorded as failed, which happens because the
# init migration tries to CREATE tables that already exist).
# Raw SQL with IF NOT EXISTS / CREATE INDEX IF NOT EXISTS is always safe to
# re-run and doesn't depend on Prisma migration state.
echo "Applying schema additions..."
for i in 1 2 3 4 5; do
  if node node_modules/prisma/build/index.js db execute --stdin <<'SQL'
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "company" TEXT;
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
  then
    echo "Schema additions OK"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "WARNING: schema apply failed after 5 attempts — server may 500 on missing columns"
  else
    echo "Attempt $i failed, retrying in 3s..."
    sleep 3
  fi
done

echo "Starting Next.js..."
exec node server.js

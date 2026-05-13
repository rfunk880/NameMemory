#!/bin/sh

echo "=== NameMemory startup ==="

# Try migrate deploy first (preferred for environments with a clean migration
# baseline). It can fail on this database because it was originally
# bootstrapped via `db push` and lacks the init baseline in
# `_prisma_migrations`. We don't fail the boot on this — we always follow up
# with `db push` below to guarantee schema.prisma is in sync with the live DB.
echo "Running prisma migrate deploy..."
for i in 1 2 3 4 5; do
  if node node_modules/prisma/build/index.js migrate deploy 2>&1; then
    echo "migrate deploy OK"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "migrate deploy failed after 5 attempts — will rely on db push"
  else
    echo "Attempt $i failed, retrying in 3s..."
    sleep 3
  fi
done

# Drop orphaned columns from earlier schema iterations. db push refuses to do
# this with --accept-data-loss=false, which causes it to exit non-zero and
# skip *every* other change — including adding new columns. Drop them
# explicitly so db push has nothing destructive left to do.
echo "Dropping orphaned columns (if present)..."
node node_modules/prisma/build/index.js db execute --stdin <<'SQL' || echo "(drop step failed, continuing)"
ALTER TABLE "Person" DROP COLUMN IF EXISTS "company";
SQL

# Final safety net: guarantee Person.active exists regardless of what
# migrate deploy / db push did. IF NOT EXISTS makes it idempotent.
echo "Ensuring Person.active column exists..."
node node_modules/prisma/build/index.js db execute --stdin <<'SQL' || echo "(active column ensure failed, continuing)"
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
SQL

# Always sync schema with `db push`. Idempotent: a no-op if everything matches.
# Non-destructive: --accept-data-loss=false errors instead of dropping data,
# so it can only add missing columns/tables to bring the DB in line with
# schema.prisma.
echo "Syncing schema with prisma db push..."
for i in 1 2 3 4 5; do
  if node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss=false 2>&1; then
    echo "db push OK"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "Warning: db push failed after 5 attempts — continuing"
  else
    echo "Attempt $i failed, retrying in 3s..."
    sleep 3
  fi
done

echo "Starting Next.js..."
exec node server.js

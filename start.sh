#!/bin/sh

echo "=== NameMemory startup ==="
echo "Running database migrations..."

MIGRATIONS_OK=0
for i in 1 2 3 4 5; do
  if node node_modules/prisma/build/index.js migrate deploy 2>&1; then
    echo "Migrations OK"
    MIGRATIONS_OK=1
    break
  fi
  if [ $i -eq 5 ]; then
    echo "Warning: migrations failed after 5 attempts"
  else
    echo "Attempt $i failed, retrying in 3s..."
    sleep 3
  fi
done

# Safety net: if migrate deploy can't apply (typically because the database
# was originally created via `db push` and lacks the migration baseline),
# fall back to `db push` so the schema still matches schema.prisma. This is
# non-destructive: --accept-data-loss=false errors instead of dropping data.
if [ "$MIGRATIONS_OK" != "1" ]; then
  echo "Falling back to prisma db push to sync schema..."
  node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss=false 2>&1 || \
    echo "Warning: db push fallback also failed — continuing"
fi

echo "Starting Next.js..."
exec node server.js

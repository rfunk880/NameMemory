#!/bin/sh
set -e

echo "=== NameMemory startup ==="

echo "Syncing database schema..."
# Try migrations first; fall back to db push for fresh installs
./node_modules/prisma/build/index.js migrate deploy 2>/dev/null \
  || ./node_modules/prisma/build/index.js db push --accept-data-loss 2>&1 | tail -3 \
  || echo "DB sync skipped"

echo "Starting Next.js..."
exec node server.js

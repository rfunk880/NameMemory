#!/bin/sh
set -e

echo "=== NameMemory startup ==="
echo "Syncing database schema..."
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss 2>&1
echo "Starting Next.js..."
exec node server.js

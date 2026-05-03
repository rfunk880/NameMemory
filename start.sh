#!/bin/sh

echo "=== NameMemory startup ==="
echo "Syncing database schema..."

# Retry db push — Postgres may not be ready immediately on cold start
for i in 1 2 3 4 5; do
  if node node_modules/prisma/build/index.js db push 2>&1; then
    echo "Schema sync OK"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "Warning: schema sync failed after 5 attempts — continuing anyway"
  else
    echo "Attempt $i failed, retrying in 3s..."
    sleep 3
  fi
done

echo "Starting Next.js..."
exec node server.js

#!/bin/sh

echo "=== NameMemory startup ==="
echo "Running database migrations..."

for i in 1 2 3 4 5; do
  if node node_modules/prisma/build/index.js migrate deploy 2>&1; then
    echo "Migrations OK"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "Warning: migrations failed after 5 attempts — continuing"
  else
    echo "Attempt $i failed, retrying in 3s..."
    sleep 3
  fi
done

echo "Starting Next.js..."
exec node server.js

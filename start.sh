#!/bin/sh

echo "=== NameMemory startup ==="

echo "Applying schema additions..."
node scripts/migrate.js || echo "WARNING: schema additions failed — server may 500 on missing columns"

echo "Starting Next.js..."
exec node server.js

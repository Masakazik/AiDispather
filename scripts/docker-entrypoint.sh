#!/bin/sh
set -e

cd /app/backend

echo "==> Applying database migrations"
npx prisma migrate deploy

cd /app
echo "==> Starting API"
exec "$@"

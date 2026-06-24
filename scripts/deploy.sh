#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/homedispatcher}"
PM2_NAME="${PM2_NAME:-homedispatcher-api}"

cd "$APP_DIR"

echo "==> Pull latest code"
git fetch origin main
git reset --hard origin/main

echo "==> Install dependencies"
npm install

echo "==> Ensure infrastructure is running"
npm run infra:up
node scripts/wait-for-infra.mjs

echo "==> Generate Prisma client"
npm run db:generate

echo "==> Apply database migrations"
npm run db:deploy

echo "==> Build frontend + backend"
npm run build

echo "==> Restart API"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME"
else
  pm2 start backend/dist/main.js --name "$PM2_NAME"
fi
pm2 save

echo "==> Deploy complete"

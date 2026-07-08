#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Pulling latest code"
git pull origin main

echo "==> Installing dependencies (frozen lockfile)"
pnpm install --frozen-lockfile

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Building"
pnpm run build

echo "==> Restarting app"
pm2 restart ecosystem.config.js

echo "==> Health check"
sleep 3
curl -sf http://127.0.0.1:4000/api > /dev/null && echo "OK: app responding on :4000" || (echo "FAILED: app not responding" && exit 1)

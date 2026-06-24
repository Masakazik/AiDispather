#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(dirname "$SCRIPT_DIR")}"

cd "$APP_DIR"

echo "🚀 Развертывание ДомДиспетчер (Docker)..."

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
DOCKER_COMPOSE_CMD="${DOCKER_COMPOSE_CMD:-docker compose}"
GIT_BRANCH="${GIT_BRANCH:-main}"
SKIP_GIT_PULL="${SKIP_GIT_PULL:-0}"
APP_PORT="${APP_PORT:-4000}"
APP_ENV_FILE="${APP_ENV_FILE:-backend/.env}"
ROOT_ENV_FILE="${ROOT_ENV_FILE:-.env}"
SKIP_FRONTEND_SYNC="${SKIP_FRONTEND_SYNC:-0}"
REMOVE_IMAGES="${REMOVE_IMAGES:-0}"
NO_CACHE_BUILD="${NO_CACHE_BUILD:-0}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
HEALTH_RETRIES="${HEALTH_RETRIES:-12}"
HEALTH_SLEEP_SEC="${HEALTH_SLEEP_SEC:-5}"

export APP_PORT
export APP_ENV_FILE

run_compose() {
  ${DOCKER_COMPOSE_CMD} -f "${COMPOSE_FILE}" "$@"
}

require_file() {
  local file_path="$1"
  if [[ ! -f "${file_path}" ]]; then
    echo "❌ Файл не найден: ${file_path}"
    exit 1
  fi
}

if [[ "${SKIP_GIT_PULL}" != "1" ]]; then
  echo "📥 Обновляем код из Git..."
  if git rev-parse --git-dir >/dev/null 2>&1; then
    git fetch origin "${GIT_BRANCH}"
    git reset --hard "origin/${GIT_BRANCH}"
  else
    echo "⚠️ Git-репозиторий не найден, пропускаем обновление кода"
  fi
else
  echo "⏭️ Пропускаем git pull (SKIP_GIT_PULL=1)"
fi

require_file "${APP_ENV_FILE}"
require_file "${ROOT_ENV_FILE}"

echo "🧪 Проверяем docker compose конфигурацию..."
run_compose config >/dev/null

if [[ "${REMOVE_IMAGES}" == "1" ]]; then
  echo "🗑️ Удаляем старые образы приложения (REMOVE_IMAGES=1)..."
  run_compose down --rmi local
fi

echo "🔨 Собираем и запускаем контейнеры..."
if [[ "${NO_CACHE_BUILD}" == "1" ]]; then
  run_compose build --no-cache app
  run_compose up -d
else
  run_compose up -d --build
fi

echo "⏳ Ждем запуск API..."
sleep "${HEALTH_SLEEP_SEC}"

health_ok=0
for ((attempt = 1; attempt <= HEALTH_RETRIES; attempt++)); do
  if curl -fsS "http://127.0.0.1:${APP_PORT}${HEALTH_PATH}" >/dev/null; then
    health_ok=1
    break
  fi
  echo "   попытка ${attempt}/${HEALTH_RETRIES}..."
  sleep "${HEALTH_SLEEP_SEC}"
done

if [[ "${health_ok}" != "1" ]]; then
  echo "⚠️ Health check не прошел. Показываю логи контейнера app:"
  run_compose logs --tail=120 app || true
  exit 1
fi

echo "✅ Health check успешен"

if [[ "${SKIP_FRONTEND_SYNC}" != "1" ]]; then
  echo "📦 Синхронизируем frontend/dist для nginx на хосте..."
  mkdir -p frontend/dist
  run_compose cp "app:/app/frontend/dist/." ./frontend/dist/
else
  echo "⏭️ Пропускаем синхронизацию frontend (SKIP_FRONTEND_SYNC=1)"
fi

echo "📊 Статус контейнеров:"
run_compose ps

echo "📜 Последние логи приложения:"
run_compose logs --tail=80 app || true

echo ""
echo "✅ Деплой завершен"
echo "   - API:     http://localhost:${APP_PORT}/api"
echo "   - Health:  http://localhost:${APP_PORT}${HEALTH_PATH}"
echo "   - Webhook: http://localhost:${APP_PORT}/webhook/max"
echo "   - Static:  ${APP_DIR}/frontend/dist (для nginx root)"
echo ""
echo "💡 Подсказки:"
echo "   SKIP_GIT_PULL=1 bash scripts/deploy.sh       # без git pull"
echo "   NO_CACHE_BUILD=1 bash scripts/deploy.sh      # сборка без кэша"
echo "   REMOVE_IMAGES=1 bash scripts/deploy.sh       # пересобрать образ с нуля"
echo ""
echo "⚠️ Если раньше использовали PM2, остановите процесс:"
echo "   pm2 delete homedispatcher-api || true"

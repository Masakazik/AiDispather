# ДомДиспетчер

Платформа управления зданиями и диспетчеризации заявок с встроенным MAX-ботом.

- **frontend/** — React + TypeScript + Vite + Zustand + PrimeReact (SPA)
- **backend/** — NestJS + Prisma + PostgreSQL + Redis + BullMQ (REST API + MAX-бот)
- **Dockerfile** + **docker-compose.yml** — production-деплой (postgres, redis, app)

Продакшен: https://domcrm.tech

> English version: [readme(en).md](readme(en).md)

## Архитектура

```
┌─────────────┐     ┌──────────────────────────────────────────┐
│  domcrm.tech│     │  Docker (docker compose)                 │
│  nginx      │────▶│  app (:4000) — API + MAX-бот            │
│             │     │    ├─ REST /api/*                        │
│  static     │     │    ├─ POST /webhook/max (без /api)       │
│  frontend/  │     │    ├─ Yandex AI → заявка in-process      │
│  dist/      │     │    postgres + redis                      │
└─────────────┘     └──────────────────────────────────────────┘
         ▲
         │ MAX messenger webhook
```

### MAX-бот (встроен в backend)

Флоу обработки сообщений в групповых чатах MAX:

```
POST /webhook/max
  → нормализация апдейта (только группы, не бот)
  → Yandex AI (классификация: проблема / не проблема)
  → если проблема → IntegrationsService → создание заявки (in-process, без HTTP)
  → ответ в чат с номером заявки
```

Модули бота в `backend/src/modules/`:

| Модуль | Назначение |
|--------|------------|
| `max/` | Webhook, long polling, отправка в MAX |
| `ai/` | Yandex AI через OpenAI SDK + Zod-схема ответа |
| `chat-messages/` | Оркестрация флоу |
| `bot-integration/` | `InternalCrmAdapter` → `IntegrationsService` |
| `bot/` | Точка сборки `BotModule` |

## Требования

- Node.js ≥ 20
- Docker + Docker Compose

## Быстрый старт (разработка)

### Linux / macOS

```bash
npm install

cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

npm run infra:up
npm run db:migrate
npm run db:seed
npm run dev
```

### Windows (PowerShell)

```powershell
npm install

Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env

npm run infra:up
npm run db:migrate
npm run db:seed
npm run dev
```

- Фронтенд: http://localhost:5173
- API: http://localhost:4000/api
- MAX webhook (dev): http://localhost:4000/webhook/max

В dev-режиме (`NODE_ENV=development`) бот дополнительно отправляет JSON-ответ AI в чат для отладки.

### Демо-учётные данные (из seed)

```
email:    admin@homedispatcher.local
password: password123
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Backend + frontend на хосте (dev) |
| `npm run dev:backend` | Только NestJS API |
| `npm run dev:frontend` | Только React |
| `npm run build` | Сборка backend + frontend |
| `npm run lint` | Линтинг |
| `npm run format` | Prettier |
| `npm run infra:up` | Postgres + Redis (без app) |
| `npm run infra:down` | Остановить контейнеры |
| `npm run infra:logs` | Логи postgres/redis |
| `npm run docker:up` | Собрать и поднять всё в Docker |
| `npm run docker:down` | Остановить все контейнеры |
| `npm run docker:logs` | Логи контейнера app |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:deploy` | Prisma migrate deploy |
| `npm run db:generate` | Перегенерация Prisma client |
| `npm run db:seed` | Демо-данные |

## Деплой на сервер (Docker)

Продакшен-деплой через `scripts/deploy.sh`:

```bash
cd /home/homedispatcher
bash scripts/deploy.sh
```

Скрипт:

1. `git fetch` + `reset --hard origin/main` (можно отключить)
2. `docker compose up -d --build` — postgres, redis, app
3. Миграции Prisma при старте контейнера (`scripts/docker-entrypoint.sh`)
4. Health check `GET /api/health`
5. Копирует `frontend/dist` из контейнера на хост для nginx

### Переменные deploy.sh

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `SKIP_GIT_PULL` | `0` | `1` — не обновлять код из git |
| `NO_CACHE_BUILD` | `0` | `1` — сборка образа без кэша |
| `REMOVE_IMAGES` | `0` | `1` — удалить старые образы перед сборкой |
| `SKIP_FRONTEND_SYNC` | `0` | `1` — не копировать static на хост |
| `APP_PORT` | `4000` | Порт API на хосте |

Примеры:

```bash
SKIP_GIT_PULL=1 bash scripts/deploy.sh
NO_CACHE_BUILD=1 bash scripts/deploy.sh
```

### Миграция с PM2

Если раньше API запускался через PM2:

```bash
pm2 delete homedispatcher-api || true
bash scripts/deploy.sh
```

Старый отдельный бот (`poverka-max-ai-bot` на `:4005`) больше не нужен — логика встроена в backend.

### nginx (domcrm.tech)

```nginx
root /home/homedispatcher/frontend/dist;
index index.html;

# MAX bot webhook (вне префикса /api)
location = /webhook/max {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

URL webhook в настройках MAX: `https://domcrm.tech/webhook/max`

## Переменные окружения

### Корень (`.env`) — docker-compose

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `POSTGRES_USER` | `homedispatcher` | Пользователь Postgres |
| `POSTGRES_PASSWORD` | `homedispatcher` | Пароль Postgres |
| `POSTGRES_DB` | `homedispatcher` | Имя БД |
| `POSTGRES_PORT` | `5432` | Порт на хосте |
| `REDIS_PORT` | `6379` | Порт на хосте |
| `APP_PORT` | `4000` | Порт app-контейнера на хосте |
| `APP_ENV_FILE` | `backend/.env` | Env-файл для контейнера app |

### Backend (`backend/.env`)

| Переменная | Назначение |
|------------|------------|
| `PORT` | Порт API (4000) |
| `CORS_ORIGIN` | Разрешённые origins (`https://domcrm.tech` на проде) |
| `DATABASE_URL` | Prisma URL (`localhost` в dev; в Docker переопределяется на `postgres`) |
| `REDIS_HOST` | Redis (`localhost` в dev; в Docker → `redis`) |
| `JWT_SECRET` | Секрет JWT |
| `MAX_BOT_TOKEN` | Токен MAX-бота |
| `MAX_MODE` | `webhook` или `long_polling` |
| `YANDEX_AI_API_KEY` | Ключ Yandex AI |
| `YANDEX_AI_PROJECT_ID` | Folder ID (заголовок OpenAI-Project) |
| `YANDEX_AI_PROMPT_ID` | ID промпта Yandex AI |
| `MAX_WEBHOOK_SECRET` | Секрет для legacy-эндпоинта `/api/integrations/max/webhook` |

### Frontend (`frontend/.env`)

| Переменная | Назначение |
|------------|------------|
| `VITE_API_BASE_URL` | Базовый путь API (`/api`) |
| `VITE_API_PROXY_TARGET` | Dev-прокси → `http://localhost:4000` |

## API

Все REST-эндпоинты под префиксом `/api`, кроме MAX webhook.

### Auth

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | `/api/auth/login` | public | Вход |
| POST | `/api/auth/register` | public | Регистрация |
| GET | `/api/auth/me` | JWT | Текущий пользователь |

### Заявки

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/api/service-requests` | JWT | Список |
| POST | `/api/service-requests` | JWT | Создание |
| GET | `/api/service-requests/:id` | JWT | Одна заявка |
| PATCH | `/api/service-requests/:id` | JWT | Обновление |
| DELETE | `/api/service-requests/:id` | JWT | Удаление |

### Прочее

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/api/health` | public | DB + Redis |
| GET/POST/PATCH/DELETE | `/api/tasks` | JWT | Задачи |
| GET/POST/PATCH/DELETE | `/api/employees` | JWT | Сотрудники |
| GET/POST/DELETE | `/api/documents` | JWT | Документы |

### MAX / интеграции

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | `/webhook/max` | public | Inbound webhook от MAX (основной) |
| POST | `/api/integrations/max/webhook` | `x-webhook-secret` | Legacy HTTP-интеграция |

## Структура проекта

```
.
├── Dockerfile
├── docker-compose.yml
├── scripts/
│   ├── deploy.sh              # production deploy
│   ├── docker-entrypoint.sh   # migrate + start
│   └── wait-for-infra.mjs
├── package.json               # npm workspaces
├── backend/
│   ├── prisma/
│   └── src/
│       ├── common/
│       ├── config/
│       ├── modules/
│       │   ├── auth/
│       │   ├── service-requests/
│       │   ├── integrations/
│       │   ├── max/             # MAX webhook + API
│       │   ├── ai/              # Yandex AI
│       │   ├── chat-messages/   # оркестрация бота
│       │   ├── bot-integration/
│       │   └── bot/
│       └── main.ts
└── frontend/
    └── src/
```

## Экраны интерфейса

| Маршрут | Экран |
|---------|-------|
| `/` | Дашборд |
| `/requests` | Заявки (Kanban / Table / Grid) |
| `/residents` | Жители |
| `/buildings` | Дома |
| `/staff` | Сотрудники |
| `/calendar` | Календарь |
| `/tasks` | Задачи |
| `/analytics` | Аналитика |
| `/documents` | Документы |
| `/settings` | Настройки |

Заявки загружаются с API (`service-requests`). Дизайн-токены: `frontend/src/styles/tokens.css`.

## Возможные проблемы

| Проблема | Решение |
|----------|---------|
| Порт 5432/6379/4000 занят | Измените порты в `.env` |
| Ошибка подключения к БД | `docker compose ps`, проверьте `DATABASE_URL` |
| Prisma не видит схему | `npm run db:generate` |
| CORS | `CORS_ORIGIN` должен содержать URL фронтенда |
| MAX webhook 404 | Убедитесь, что nginx проксирует `/webhook/max`, не `/api/webhook/max` |
| Бот не отвечает | Проверьте `MAX_BOT_TOKEN`, `YANDEX_AI_*` в `backend/.env` |

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) при push в `main` подключается по SSH и запускает `bash scripts/deploy.sh`.

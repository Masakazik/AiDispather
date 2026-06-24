# DomDispatcher (ДомДиспетчер)

Building management and service-request dispatch platform with a built-in MAX messenger bot.

- **frontend/** — React + TypeScript + Vite + Zustand + PrimeReact (SPA)
- **backend/** — NestJS + Prisma + PostgreSQL + Redis + BullMQ (REST API + MAX bot)
- **Dockerfile** + **docker-compose.yml** — production deploy (postgres, redis, app)

Production: https://domcrm.tech

> Russian version: [README.md](README.md)

## Architecture

```
┌─────────────┐     ┌──────────────────────────────────────────┐
│  domcrm.tech│     │  Docker (docker compose)                 │
│  nginx      │────▶│  app (:4000) — API + MAX bot             │
│             │     │    ├─ REST /api/*                        │
│  static     │     │    ├─ POST /webhook/max (no /api prefix) │
│  frontend/  │     │    ├─ Yandex AI → ticket in-process      │
│  dist/      │     │    postgres + redis                      │
└─────────────┘     └──────────────────────────────────────────┘
         ▲
         │ MAX messenger webhook
```

### MAX bot (embedded in backend)

Group-chat message flow:

```
POST /webhook/max
  → normalize update (groups only, skip bot messages)
  → Yandex AI (problem / not a problem)
  → if problem → IntegrationsService → create service request (in-process)
  → reply in chat with ticket number
```

Bot modules in `backend/src/modules/`:

| Module | Purpose |
|--------|---------|
| `max/` | Webhook, long polling, send to MAX |
| `ai/` | Yandex AI via OpenAI SDK + Zod response schema |
| `chat-messages/` | Flow orchestration |
| `bot-integration/` | `InternalCrmAdapter` → `IntegrationsService` |
| `bot/` | `BotModule` entry point |

## Prerequisites

- Node.js ≥ 20
- Docker + Docker Compose

## Quick start (development)

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

- Frontend: http://localhost:5173
- API: http://localhost:4000/api
- MAX webhook (dev): http://localhost:4000/webhook/max

In `NODE_ENV=development` the bot also posts the AI JSON response to the chat for debugging.

### Demo credentials (from seed)

```
email:    admin@homedispatcher.local
password: password123
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Backend + frontend on host (dev) |
| `npm run dev:backend` | NestJS API only |
| `npm run dev:frontend` | React only |
| `npm run build` | Build backend + frontend |
| `npm run lint` | Lint |
| `npm run format` | Prettier |
| `npm run infra:up` | Postgres + Redis only |
| `npm run infra:down` | Stop containers |
| `npm run docker:up` | Build and run everything in Docker |
| `npm run docker:down` | Stop all containers |
| `npm run docker:logs` | App container logs |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:deploy` | Prisma migrate deploy |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed demo data |

## Production deploy (Docker)

```bash
cd /home/homedispatcher
bash scripts/deploy.sh
```

The script:

1. Updates code from git (optional skip)
2. `docker compose up -d --build` — postgres, redis, app
3. Runs Prisma migrations on container start (`scripts/docker-entrypoint.sh`)
4. Health check `GET /api/health`
5. Copies `frontend/dist` from the container to the host for nginx

### deploy.sh variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SKIP_GIT_PULL` | `0` | `1` — skip git update |
| `NO_CACHE_BUILD` | `0` | `1` — build without cache |
| `REMOVE_IMAGES` | `0` | `1` — remove old images first |
| `SKIP_FRONTEND_SYNC` | `0` | `1` — skip static copy to host |
| `APP_PORT` | `4000` | API port on host |

### Migrating from PM2

```bash
pm2 delete homedispatcher-api || true
bash scripts/deploy.sh
```

The standalone `poverka-max-ai-bot` container on port `:4005` is no longer needed.

### nginx (domcrm.tech)

```nginx
root /home/homedispatcher/frontend/dist;
index index.html;

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

MAX webhook URL: `https://domcrm.tech/webhook/max`

## Environment variables

### Root (`.env`) — docker-compose

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_USER` | `homedispatcher` | Postgres user |
| `POSTGRES_PASSWORD` | `homedispatcher` | Postgres password |
| `POSTGRES_DB` | `homedispatcher` | Database name |
| `POSTGRES_PORT` | `5432` | Host port |
| `REDIS_PORT` | `6379` | Host port |
| `APP_PORT` | `4000` | App container host port |
| `APP_ENV_FILE` | `backend/.env` | Env file for app container |

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (4000) |
| `CORS_ORIGIN` | Allowed origins |
| `DATABASE_URL` | Prisma URL (`localhost` in dev; overridden to `postgres` in Docker) |
| `REDIS_HOST` | Redis host |
| `JWT_SECRET` | JWT signing secret |
| `MAX_BOT_TOKEN` | MAX bot token |
| `MAX_MODE` | `webhook` or `long_polling` |
| `YANDEX_AI_API_KEY` | Yandex AI key |
| `YANDEX_AI_PROJECT_ID` | Folder ID |
| `YANDEX_AI_PROMPT_ID` | Prompt ID |
| `MAX_WEBHOOK_SECRET` | Legacy `/api/integrations/max/webhook` secret |

### Frontend (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base path (`/api`) |
| `VITE_API_PROXY_TARGET` | Dev proxy target |

## API

REST endpoints use the `/api` prefix. MAX webhook does not.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/webhook/max` | public | MAX inbound webhook (primary) |
| POST | `/api/integrations/max/webhook` | `x-webhook-secret` | Legacy HTTP integration |
| GET | `/api/health` | public | DB + Redis health |
| POST | `/api/auth/login` | public | Login |
| GET | `/api/service-requests` | JWT | List requests |
| POST | `/api/service-requests` | JWT | Create request |

See [README.md](README.md) for the full endpoint list.

## Project structure

```
.
├── Dockerfile
├── docker-compose.yml
├── scripts/deploy.sh
├── backend/src/modules/max|ai|chat-messages|bot-integration|bot/
└── frontend/src/
```

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) runs `bash scripts/deploy.sh` on push to `main`.

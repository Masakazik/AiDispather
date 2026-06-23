# ДомДиспетчер

Building / dispatch management platform.

- **frontend/** — React + TypeScript + Vite + Zustand + PrimeReact (SPA, talks to the API over REST)
- **backend/** — NestJS + Prisma + PostgreSQL + Redis + BullMQ (REST API)
- **docker-compose.yml** — PostgreSQL + Redis for local development

The React frontend and NestJS backend run in dev mode on the host; PostgreSQL and
Redis run in Docker containers.

## Prerequisites

- Node.js ≥ 20
- Docker + Docker Compose

## Quick start

```bash
# 1. Install dependencies (root + both workspaces)
npm install

# 2. Create env files from the examples
cp .env.example .env                 # docker-compose (Postgres/Redis)
cp backend/.env.example backend/.env # NestJS API
cp frontend/.env.example frontend/.env

# 3. Start infrastructure (PostgreSQL + Redis) in Docker
npm run infra:up

# 4. Apply the database schema and seed demo data
npm run db:migrate     # creates tables (prisma migrate dev)
npm run db:seed        # seeds a demo admin user

# 5. Start both apps in dev mode (backend :4000, frontend :5173)
npm run dev
```

Then open http://localhost:5173.

### Demo credentials (from the seed)

```
email:    admin@homedispatcher.local
password: password123
```

## Useful scripts (run from the repo root)

| Command                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Run backend + frontend concurrently (dev mode)     |
| `npm run dev:backend`  | Run only the NestJS API                            |
| `npm run dev:frontend` | Run only the React app                             |
| `npm run build`        | Build both apps                                    |
| `npm run lint`         | Lint both apps                                     |
| `npm run format`       | Prettier across the repo                           |
| `npm run infra:up`     | Start PostgreSQL + Redis (Docker)                  |
| `npm run infra:down`   | Stop the containers                                |
| `npm run db:migrate`   | Run Prisma migrations                              |
| `npm run db:generate`  | Regenerate the Prisma client                       |
| `npm run db:seed`      | Seed demo data                                     |

## Environment variables

### Root (`.env`) — consumed by docker-compose

| Variable            | Default          | Purpose             |
| ------------------- | ---------------- | ------------------- |
| `POSTGRES_USER`     | `homedispatcher` | Postgres user       |
| `POSTGRES_PASSWORD` | `homedispatcher` | Postgres password   |
| `POSTGRES_DB`       | `homedispatcher` | Database name       |
| `POSTGRES_PORT`     | `5432`           | Host port           |
| `REDIS_PORT`        | `6379`           | Host port           |

### Backend (`backend/.env`)

| Variable        | Default                          | Purpose                       |
| --------------- | -------------------------------- | ----------------------------- |
| `PORT`          | `4000`                           | API port                      |
| `CORS_ORIGIN`   | `http://localhost:5173`          | Allowed origins (comma-sep)   |
| `DATABASE_URL`  | `postgresql://…@localhost:5432/…`| Prisma connection string      |
| `REDIS_HOST`    | `localhost`                      | Redis host (cache + BullMQ)   |
| `REDIS_PORT`    | `6379`                           | Redis port                    |
| `JWT_SECRET`    | —                                | JWT signing secret            |
| `JWT_EXPIRES_IN`| `1d`                             | Token lifetime                |
| `CACHE_TTL`     | `60`                             | Cache TTL (seconds)           |

### Frontend (`frontend/.env`)

| Variable                | Default                 | Purpose                          |
| ----------------------- | ----------------------- | -------------------------------- |
| `VITE_API_BASE_URL`     | `/api`                  | API base path                    |
| `VITE_API_PROXY_TARGET` | `http://localhost:4000` | Dev proxy target for `/api`      |

## API surface (initial)

| Method | Path                       | Auth   | Description              |
| ------ | -------------------------- | ------ | ------------------------ |
| POST   | `/api/auth/login`          | public | Email/password login     |
| POST   | `/api/auth/register`       | public | Create an account        |
| GET    | `/api/auth/me`             | JWT    | Current user profile     |
| GET    | `/api/health`              | public | DB + Redis health        |
| GET    | `/api/service-requests`    | JWT    | List (paginated/filter)  |
| POST   | `/api/service-requests`    | JWT    | Create (enqueues notify) |
| GET    | `/api/service-requests/:id`| JWT    | Get one (Redis-cached)   |
| PATCH  | `/api/service-requests/:id`| JWT    | Update                   |
| DELETE | `/api/service-requests/:id`| JWT    | Delete                   |

## Project structure

```
.
├── docker-compose.yml
├── package.json            # npm workspaces (frontend, backend)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── common/         # guards, decorators, filters, interfaces
│       ├── config/         # env loading + validation
│       ├── prisma/         # PrismaModule/Service
│       ├── redis/          # RedisModule/Service (cache helpers)
│       ├── queue/          # BullMQ module + processors
│       ├── modules/        # auth, users, service-requests
│       ├── health/
│       ├── app.module.ts
│       └── main.ts
└── frontend/
    └── src/
        ├── app/            # bootstrap + router
        ├── components/     # shared/reusable components
        ├── constants/      # routes, nav, config
        ├── features/       # feature modules (auth, …)
        ├── hooks/
        ├── layouts/        # MainLayout, AuthLayout
        ├── pages/          # route components
        ├── services/       # API layer (axios)
        ├── store/          # Zustand stores
        ├── styles/         # tokens + global css
        ├── types/
        └── utils/
```

### UI screens

The ДомДиспетчер design is recreated faithfully across 10 screens, all behind
authentication and fully responsive (desktop / tablet / mobile):

| Route          | Screen      | Highlights                                              |
| -------------- | ----------- | ------------------------------------------------------- |
| `/`            | Дашборд     | KPI cards, weekly chart, AI insights, status donut, load |
| `/requests`    | Заявки      | Kanban / Table / Grid views, filters, priority tabs     |
| `/residents`   | Жители      | Resident cards → profile drawer                         |
| `/buildings`   | Дома        | Building cards with SLA meters                          |
| `/staff`       | Сотрудники  | Employee cards with load + stats                        |
| `/calendar`    | Календарь   | Month grid + planned works                              |
| `/tasks`       | Задачи      | Team checklist (toggleable)                             |
| `/analytics`   | Аналитика   | KPIs, charts, per-building SLA comparison               |
| `/documents`   | Документы   | Document archive list                                   |
| `/settings`    | Настройки   | AI toggles + integrations                               |

Clicking any request opens the **ticket detail drawer** (AI analysis, timeline,
comments, actions); clicking a resident opens the **resident profile drawer**.

Design tokens are ported verbatim to `frontend/src/styles/tokens.css`; icons use
`@phosphor-icons/react`; fonts are Inter + Manrope. The dispatch screens render
from a typed mock dataset (`frontend/src/features/dispatch/data.ts`) that is
ready to be swapped for live API calls via the existing `services/` layer.

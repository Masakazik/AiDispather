# ДомДиспетчер

Платформа управления зданиями и диспетчеризации заявок.

- **frontend/** — React + TypeScript + Vite + Zustand + PrimeReact (SPA, взаимодействует с API по REST)
- **backend/** — NestJS + Prisma + PostgreSQL + Redis + BullMQ (REST API)
- **docker-compose.yml** — PostgreSQL + Redis для локальной разработки

React-фронтенд и NestJS-бэкенд запускаются в режиме разработки на хосте; PostgreSQL и Redis работают в Docker-контейнерах.

## Требования

- Node.js ≥ 20
- Docker + Docker Compose

## Быстрый старт

### Linux / macOS

```bash
# 1. Установить зависимости (корень + оба workspace)
npm install

# 2. Создать файлы окружения из примеров
cp .env.example .env                 # docker-compose (Postgres/Redis)
cp backend/.env.example backend/.env # NestJS API
cp frontend/.env.example frontend/.env

# 3. Запустить инфраструктуру (PostgreSQL + Redis) в Docker
npm run infra:up

# 4. Применить схему БД и заполнить демо-данными
npm run db:migrate     # создаёт таблицы (prisma migrate dev)
npm run db:seed        # создаёт демо-пользователя admin

# 5. Запустить оба приложения в dev-режиме (backend :4000, frontend :5173)
npm run dev
```

### Windows (PowerShell)

```powershell
# 1. Установить зависимости
npm install

# 2. Создать файлы окружения из примеров
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env

# 3. Запустить инфраструктуру (PostgreSQL + Redis) в Docker
npm run infra:up

# 4. Применить схему БД и заполнить демо-данными
npm run db:migrate
npm run db:seed

# 5. Запустить оба приложения
npm run dev
```

Откройте в браузере: http://localhost:5173

### Демо-учётные данные (из seed)

```
email:    admin@homedispatcher.local
password: password123
```

## Полезные команды (из корня репозитория)

| Команда                | Описание                                              |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Запуск backend + frontend одновременно (dev-режим)    |
| `npm run dev:backend`  | Только NestJS API                                     |
| `npm run dev:frontend` | Только React-приложение                               |
| `npm run build`        | Сборка обоих приложений                               |
| `npm run lint`         | Линтинг обоих приложений                              |
| `npm run format`       | Prettier по всему репозиторию                         |
| `npm run infra:up`     | Запуск PostgreSQL + Redis (Docker)                    |
| `npm run infra:down`   | Остановка контейнеров                                 |
| `npm run infra:logs`   | Просмотр логов контейнеров                            |
| `npm run db:migrate`   | Применение миграций Prisma                            |
| `npm run db:generate`  | Перегенерация Prisma-клиента                          |
| `npm run db:seed`      | Заполнение демо-данными                               |

## Переменные окружения

### Корень (`.env`) — используется docker-compose

| Переменная          | По умолчанию     | Назначение          |
| ------------------- | ---------------- | ------------------- |
| `POSTGRES_USER`     | `homedispatcher` | Пользователь Postgres |
| `POSTGRES_PASSWORD` | `homedispatcher` | Пароль Postgres     |
| `POSTGRES_DB`       | `homedispatcher` | Имя базы данных     |
| `POSTGRES_PORT`     | `5432`           | Порт на хосте       |
| `REDIS_PORT`        | `6379`           | Порт на хосте       |

### Backend (`backend/.env`)

| Переменная       | По умолчанию                       | Назначение                        |
| ---------------- | ---------------------------------- | --------------------------------- |
| `PORT`           | `4000`                             | Порт API                          |
| `CORS_ORIGIN`    | `http://localhost:5173`            | Разрешённые origins (через запятую) |
| `DATABASE_URL`   | `postgresql://…@localhost:5432/…`  | Строка подключения Prisma         |
| `REDIS_HOST`     | `localhost`                        | Хост Redis (кэш + BullMQ)         |
| `REDIS_PORT`     | `6379`                             | Порт Redis                        |
| `JWT_SECRET`     | —                                  | Секрет подписи JWT                |
| `JWT_EXPIRES_IN` | `1d`                               | Время жизни токена                |
| `CACHE_TTL`      | `60`                               | TTL кэша (секунды)                |

### Frontend (`frontend/.env`)

| Переменная              | По умолчанию              | Назначение                              |
| ----------------------- | ------------------------- | --------------------------------------- |
| `VITE_API_BASE_URL`     | `/api`                    | Базовый путь API                        |
| `VITE_API_PROXY_TARGET` | `http://localhost:4000`   | Цель dev-прокси для `/api`              |

## API (начальный набор эндпоинтов)

| Метод  | Путь                        | Авторизация | Описание                        |
| ------ | --------------------------- | ----------- | ------------------------------- |
| POST   | `/api/auth/login`           | публичный   | Вход по email/паролю            |
| POST   | `/api/auth/register`        | публичный   | Регистрация аккаунта            |
| GET    | `/api/auth/me`              | JWT         | Профиль текущего пользователя   |
| GET    | `/api/health`               | публичный   | Проверка DB + Redis             |
| GET    | `/api/service-requests`     | JWT         | Список (пагинация/фильтры)      |
| POST   | `/api/service-requests`     | JWT         | Создание (ставит в очередь уведомление) |
| GET    | `/api/service-requests/:id` | JWT         | Получить одну (кэш Redis)       |
| PATCH  | `/api/service-requests/:id` | JWT         | Обновление                      |
| DELETE | `/api/service-requests/:id` | JWT         | Удаление                        |

## Структура проекта

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
│       ├── config/         # загрузка и валидация env
│       ├── prisma/         # PrismaModule/Service
│       ├── redis/          # RedisModule/Service (хелперы кэша)
│       ├── queue/          # BullMQ module + processors
│       ├── modules/        # auth, users, service-requests
│       ├── health/
│       ├── app.module.ts
│       └── main.ts
└── frontend/
    └── src/
        ├── app/            # bootstrap + router
        ├── components/     # общие/переиспользуемые компоненты
        ├── constants/      # routes, nav, config
        ├── features/       # feature-модули (auth, …)
        ├── hooks/
        ├── layouts/        # MainLayout, AuthLayout
        ├── pages/          # компоненты маршрутов
        ├── services/       # API-слой (axios)
        ├── store/          # Zustand stores
        ├── styles/         # tokens + global css
        ├── types/
        └── utils/
```

### Экраны интерфейса

Дизайн ДомДиспетчера воспроизведён на 10 экранах — все за авторизацией, полностью адаптивны (desktop / tablet / mobile):

| Маршрут        | Экран       | Особенности                                                    |
| -------------- | ----------- | -------------------------------------------------------------- |
| `/`            | Дашборд     | KPI-карточки, недельный график, AI-инсайты, donut статусов, нагрузка |
| `/requests`    | Заявки      | Kanban / Table / Grid, фильтры, вкладки приоритетов            |
| `/residents`   | Жители      | Карточки жителей → drawer профиля                              |
| `/buildings`   | Дома        | Карточки зданий с SLA-метрами                                  |
| `/staff`       | Сотрудники  | Карточки сотрудников с нагрузкой и статистикой                 |
| `/calendar`    | Календарь   | Сетка месяца + плановые работы                                 |
| `/tasks`       | Задачи      | Командный чеклист (переключаемый)                              |
| `/analytics`   | Аналитика   | KPI, графики, сравнение SLA по зданиям                         |
| `/documents`   | Документы   | Архив документов                                               |
| `/settings`    | Настройки   | Переключатели AI + интеграции                                  |

Клик по заявке открывает **drawer деталей тикета** (AI-анализ, таймлайн, комментарии, действия); клик по жителю — **drawer профиля жителя**.

Дизайн-токены перенесены в `frontend/src/styles/tokens.css`; иконки — `@phosphor-icons/react`; шрифты — Inter + Manrope. Экраны диспетчеризации рендерятся из типизированного mock-набора данных (`frontend/src/features/dispatch/data.ts`), готового к замене на живые API-вызовы через слой `services/`.

## Пошаговая инструкция запуска

1. **Убедитесь, что установлены** Node.js 20+, Docker Desktop (с Docker Compose).
2. **Клонируйте репозиторий** и перейдите в его корневую папку.
3. **Установите зависимости:** `npm install`
4. **Создайте `.env` файлы** из примеров (см. раздел «Быстрый старт» выше).
5. **Запустите Docker-контейнеры:** `npm run infra:up` — поднимутся PostgreSQL (порт 5432) и Redis (порт 6379).
6. **Инициализируйте БД:** `npm run db:migrate`, затем `npm run db:seed`.
7. **Запустите приложение:** `npm run dev`
   - API: http://localhost:4000
   - Фронтенд: http://localhost:5173
8. **Войдите** с демо-учётными данными (см. выше).

### Остановка

```bash
# Остановить dev-серверы — Ctrl+C в терминале

# Остановить Docker-контейнеры
npm run infra:down
```

### Возможные проблемы

| Проблема | Решение |
| -------- | ------- |
| Порт 5432 или 6379 занят | Измените `POSTGRES_PORT` / `REDIS_PORT` в `.env` и обновите `DATABASE_URL` / `REDIS_PORT` в `backend/.env` |
| Ошибка подключения к БД | Убедитесь, что `npm run infra:up` выполнен и контейнеры healthy: `docker compose ps` |
| Prisma не видит схему | Выполните `npm run db:generate`, затем `npm run db:migrate` |
| CORS-ошибки | Проверьте, что `CORS_ORIGIN` в `backend/.env` содержит `http://localhost:5173` |

# Soynativo — Language Learning Platform

Кроссплатформенное (iOS / Android) приложение для школы иностранных языков: личные кабинеты учеников, преподавателей и администратора, видеоуроки на базе Google Meet, бронирование, записи, уведомления через Telegram-бота.

Архитектура спроектирована **под рост** — модульный монолит с чёткими границами, готовый к выделению модулей в отдельные сервисы по мере роста нагрузки.

## Стек

**Mobile** — React Native + Expo, TypeScript, React Navigation, TanStack Query, Zustand, i18next (ru/en/es), expo-secure-store для токенов.

**Backend** — Node.js + Express, TypeScript, TypeORM (PostgreSQL), Zod-валидация, tsyringe (DI), BullMQ + Redis (очереди), Pino (логи), Helmet + rate-limit, Swagger/OpenAPI.

**Инфраструктура** — Docker + docker-compose (postgres + redis + backend + worker), GitHub Actions, Yarn Workspaces (monorepo).

## Структура

```
soynativo-app/
├── apps/
│   ├── mobile/                # React Native (Expo)
│   │   └── src/
│   │       ├── app/           # bootstrap, navigation, providers
│   │       ├── features/      # auth, lessons, bookings, profile, video-call
│   │       └── shared/        # api, ui kit, theme, i18n, store, config
│   │
│   └── backend/               # Express API
│       └── src/
│           ├── config/        # типизированные env (Zod)
│           ├── core/          # database, di, events, queue, cache, logger, http
│           ├── modules/       # auth, users, lessons, bookings, notifications, recordings
│           ├── shared/        # middleware, exceptions, types
│           ├── integrations/  # google-meet, telegram, firebase
│           ├── app.ts         # Express setup
│           └── server.ts      # bootstrap + graceful shutdown
│
├── packages/
│   └── shared/                # типы и утилиты, общие для mobile и backend
│
├── docs/
│   ├── adr/                   # Architecture Decision Records
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── API.md
│   └── DATABASE.md
│
├── docker-compose.yml
├── apps/backend/Dockerfile    # multi-stage production image
├── package.json               # workspaces root
└── README.md
```

## Архитектурные принципы

1. **Модульный монолит** — каждый бизнес-модуль самодостаточен и может быть выделен в сервис при необходимости. См. [ADR-0001](docs/adr/0001-modular-monolith.md).
2. **Clean Architecture в backend** — `Controller → Service → Repository → Entity`. Бизнес-логика не знает про HTTP и БД.
3. **Feature-sliced mobile** — `features/X` не зависит от `features/Y`. Общее живёт в `shared/`. См. [ADR-0003](docs/adr/0003-feature-sliced-mobile.md).
4. **EventBus для in-process событий + BullMQ для фоновой работы** — см. [ADR-0002](docs/adr/0002-event-bus-and-queues.md).
5. **Безопасные дефолты** — Helmet, CORS allow-list, rate-limit, валидация Zod, токены в Keychain, секреты из env с проверкой при старте.

## Быстрый старт

```bash
# Поднять postgres + redis + backend через Docker
docker compose up -d

# Установить зависимости
yarn install

# Запустить backend (без Docker) и мобильное приложение
cp apps/backend/.env.example apps/backend/.env
cp apps/mobile/.env.example apps/mobile/.env
yarn dev
```

Тестирование на iPhone 14 Pro Max — через **Expo Go** (отсканировать QR-код после `yarn workspace @soynativo/mobile start`).

Подробнее см. [SETUP.md](SETUP.md) и [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Документация

- [SETUP.md](SETUP.md) — первоначальная настройка
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — обзор архитектуры
- [docs/adr/](docs/adr/) — записи об архитектурных решениях
- [docs/API.md](docs/API.md) — API endpoints
- [docs/DATABASE.md](docs/DATABASE.md) — схема БД
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — гайд разработчика
- [apps/backend/src/modules/README.md](apps/backend/src/modules/README.md) — правила модулей backend
- [apps/mobile/src/README.md](apps/mobile/src/README.md) — структура mobile

## Roadmap

- [x] Foundation: модульный монолит, Clean Architecture, DI, очереди, Docker, i18n
- [ ] Auth UX: регистрация, восстановление пароля, OTP
- [ ] Lessons CRUD + календарь
- [ ] Bookings с проверкой пересечений
- [ ] Google Meet: создание встречи + ссылка для участников
- [ ] Telegram bot: уведомления + handlers команд
- [ ] Recordings: загрузка/просмотр
- [ ] Платежи (Stripe)
- [ ] Чат внутри приложения
- [ ] Push-уведомления (FCM)

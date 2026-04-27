# Soynativo - Language Learning Platform

Кроссплатформенное приложение для обучения иностранным языкам с видеозвонками, расписанием уроков и интеграцией с Telegram.

## 🏗️ Архитектура проекта

```
soynativo-app/
├── apps/
│   ├── mobile/          # React Native + Expo (iOS/Android)
│   └── backend/         # Node.js + Express API
├── packages/
│   ├── shared/          # Общие типы и утилиты
│   └── components/      # Переиспользуемые компоненты (web)
├── docs/                # Документация
└── .github/             # GitHub workflows (CI/CD)
```

## 🛠️ Технологический стек

### Frontend (Mobile)
- **React Native** + **Expo** - кроссплатформенная разработка
- **TypeScript** - типизация
- **Zustand/Redux** - управление состоянием
- **React Navigation** - навигация
- **Axios/React Query** - HTTP запросы

### Backend
- **Node.js** + **Express.js** - REST API
- **TypeScript** - типизация
- **PostgreSQL** - основная БД (или MongoDB)
- **JWT** - аутентификация
- **Socket.io** - real-time уведомления

### Интеграции
- **Google Meet API** - видеозвонки
- **Telegram Bot API** - уведомления
- **Firebase Cloud Messaging** - push-уведомления

## 📱 Основные модули

- **Auth** - Аутентификация и авторизация
- **Users** - Профили учеников/учителей/администраторов
- **Lessons** - Управление уроками и расписанием
- **Bookings** - Бронирование времени
- **Video Calls** - Видеозвонки (Google Meet)
- **Notifications** - Телеграм уведомления
- **Recordings** - Записи уроков

## ✅ Лучшие практики

- ✓ Monorepo структура (управление несколькими пакетами)
- ✓ TypeScript везде (type-safety)
- ✓ Environment variables (.env)
- ✓ Docker для контейнеризации
- ✓ ESLint + Prettier (code quality)
- ✓ Pre-commit hooks (husky + lint-staged)
- ✓ Jest тесты
- ✓ API documentation (Swagger/OpenAPI)
- ✓ CI/CD pipelines (GitHub Actions)

## 🚀 Начало работы

```bash
# Установка зависимостей
yarn install

# Запуск мобильного приложения
cd apps/mobile && yarn start

# Запуск бэкенда
cd apps/backend && yarn dev

# Запуск тестов
yarn test
```

## 📖 Документация

- [API Docs](docs/api.md)
- [Architecture](docs/architecture.md)
- [Database Schema](docs/database.md)
- [Development Guide](docs/development.md)

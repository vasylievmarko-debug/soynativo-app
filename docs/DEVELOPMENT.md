# 🚀 Руководство по развертыванию

## Требования

- Node.js >= 18.0.0
- Yarn >= 3.6.0
- Git
- PostgreSQL (для разработки)

## Установка

### 1. Клонируем репозиторий

```bash
git clone <repository-url>
cd soynativo-app
```

### 2. Установим зависимости

```bash
yarn install
```

### 3. Настроим окружение

Копируем `.env.example` файлы:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/mobile/.env.example apps/mobile/.env
```

### 4. Настройка базы данных

Создаем локальную PostgreSQL БД:

```bash
createdb soynativo
```

Обновите `DATABASE_URL` в `apps/backend/.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/soynativo
```

### 5. Запуск приложения

#### Разработка (оба приложения одновременно)

```bash
yarn dev
```

Это запустит:
- Mobile app: http://localhost:19006
- Backend: http://localhost:3000

#### Отдельно

**Backend:**
```bash
cd apps/backend
yarn dev
```

**Mobile:**
```bash
cd apps/mobile
yarn start
```

## iOS Testing на iPhone 14 Pro Max

### Использование Expo Go

1. Установите Expo Go на iPhone 14 Pro Max из App Store
2. Запустите: `yarn workspace @soynativo/mobile start`
3. Отсканируйте QR код в Expo Go

### Использование EAS Build

```bash
cd apps/mobile
yarn build:ios
```

## Команды для разработки

```bash
# Лinting
yarn lint

# Форматирование кода
yarn format

# Type checking
yarn type-check

# Тесты
yarn test

# Тесты в режиме watch
yarn test:watch

# Build
yarn build
```

## Структура файлов

### Mobile App
```
apps/mobile/
├── src/
│   ├── screens/          # Экраны приложения
│   ├── components/       # Переиспользуемые компоненты
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API сервисы
│   ├── store/            # Управление состоянием
│   ├── types/            # TypeScript типы
│   ├── utils/            # Утилиты
│   ├── navigation/       # Навигация
│   └── App.tsx           # Entry point
└── app.json              # Конфиг Expo
```

### Backend
```
apps/backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API маршруты
│   ├── database/         # DB конфиги и миграции
│   ├── middleware/       # Express middleware
│   ├── types/            # TypeScript типы
│   ├── utils/            # Утилиты
│   ├── config/           # Конфигурация
│   └── index.ts          # Entry point
└── .env.example          # Пример .env
```

## Pre-commit Hooks

Проект использует Husky + Lint-staged для автоматической проверки кода перед коммитом:

- Lint TypeScript файлы
- Форматирование с Prettier
- Type checking

Если hook не прошел, исправьте ошибки и попробуйте снова.

## Советы по разработке

1. **Используйте TypeScript** - строгая типизация помогает избежать ошибок
2. **Следуйте стилю кода** - запустите `yarn format`
3. **Пишите тесты** - особенно для бизнес-логики
4. **Документируйте API** - используйте JSDoc комментарии
5. **Не коммитьте .env файлы** - используйте `.env.example`

## Troubleshooting

### Порт 3000 занят

```bash
lsof -i :3000
kill -9 <PID>
```

### Expo проблемы

```bash
cd apps/mobile
yarn install
expo start --clear
```

### Database ошибки

```bash
# Удалить и пересоздать БД
dropdb soynativo
createdb soynativo
```

## Дальше

- Прочитайте [ARCHITECTURE.md](./ARCHITECTURE.md) для понимания общей архитектуры
- Смотрите документацию конкретных модулей в соответствующих папках

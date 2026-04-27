# 🛠️ Первоначальная настройка проекта

## Шаг 1: Подготовка окружения

### Требования
- Node.js ≥ 18 (проверьте: `node --version`)
- Yarn ≥ 3.6 (проверьте: `yarn --version`)
- PostgreSQL 14+ (для бэкенда)
- Git

### Установка зависимостей Yarn
```bash
corepack enable
corepack prepare yarn@stable --activate
```

## Шаг 2: Установка зависимостей проекта

```bash
cd /home/user/soynativo-app
yarn install
```

Это установит все зависимости для всех workspace'ов (mobile, backend, shared).

## Шаг 3: Подготовка бэкенда

### 3.1 Создание файла .env

```bash
cp apps/backend/.env.example apps/backend/.env
```

Обновите значения в `apps/backend/.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/soynativo
JWT_SECRET=your-super-secret-key-change-in-production
```

### 3.2 Настройка базы данных PostgreSQL

```bash
# Создать БД
createdb soynativo

# Или через psql:
psql -U postgres -c "CREATE DATABASE soynativo;"
```

## Шаг 4: Подготовка мобильного приложения

### 4.1 Создание .env файла

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

### 4.2 Установка Expo (если не установлено)

```bash
npm install -g expo-cli
```

## Шаг 5: Запуск проекта

### Вариант 1: Оба приложения одновременно

```bash
yarn dev
```

Это запустит:
- **Бэкенд**: http://localhost:3000
- **Мобильное приложение**: http://localhost:19006

### Вариант 2: Отдельный запуск

**Только бэкенд:**
```bash
cd apps/backend
yarn dev
```

**Только мобильное приложение:**
```bash
cd apps/mobile
yarn start
```

На появившемся экране:
- Нажмите **i** для iOS
- Нажмите **a** для Android
- Отсканируйте QR код камерой на iPhone (будет использоваться Expo Go)

## Шаг 6: Тестирование на iPhone 14 Pro Max

### Используя Expo Go (рекомендуется для разработки)

1. На iPhone 14 Pro Max установите **Expo Go** из App Store
2. Убедитесь, что ваш компьютер и iPhone в одной сети Wi-Fi
3. Отсканируйте QR код в Expo Go
4. Приложение загрузится на устройство

### Используя физический build (для тестирования перед релизом)

```bash
cd apps/mobile
yarn build:ios
```

Следуйте инструкциям EAS Build для создания полного iOS приложения.

## Шаг 7: Проверка кода

### Лinting
```bash
yarn lint
```

### Type checking
```bash
yarn type-check
```

### Форматирование
```bash
yarn format
```

### Тесты
```bash
yarn test
```

## Шаг 8: Git Setup

### Инициализация Husky hooks

```bash
yarn prepare
```

Это установит pre-commit hooks для автоматической проверки кода.

## Проверка установки

Все должно быть готово. Проверьте:

```bash
# 1. Версия Node.js
node --version

# 2. Версия Yarn
yarn --version

# 3. Зависимости установлены
yarn workspaces list

# 4. Бэкенд работает
curl http://localhost:3000/health

# 5. Мобильное приложение запускается
cd apps/mobile && yarn start
```

## Структура рабочего процесса

```
┌─────────────────┐
│  VS Code (IDE)  │
└────────┬────────┘
         │
    ┌────▼────────────┐
    │  yarn dev       │
    └────┬─────┬──────┘
         │     │
    ┌────▼─┐ ┌─▼──────────┐
    │ BE   │ │ Mobile App │
    │:3000 │ │  :19006    │
    └──────┘ └────────────┘
```

## Полезные команды

```bash
# Посмотреть все available scripts
yarn run

# Очистить cache и переустановить зависимости
rm -rf node_modules && yarn install

# Рестарт Expo
Ctrl+C в терминале и yarn start снова

# Отладка мобильного приложения
Откройте Developer Menu в Expo Go (встряхните устройство)
```

## Troubleshooting

### 🔴 Ошибка "Cannot find module"
```bash
rm -rf node_modules yarn.lock
yarn install
```

### 🔴 Порт 3000 уже используется
```bash
lsof -i :3000
kill -9 <PID>
```

### 🔴 Ошибка подключения к БД
- Проверьте, что PostgreSQL работает
- Проверьте DATABASE_URL в apps/backend/.env
- Попробуйте: `createdb soynativo`

### 🔴 Экран белый в Expo Go
1. Откройте Developer Menu (встряхните устройство)
2. Нажмите "Reload"
3. Если не сработало, перезапустите сервер: `yarn workspace @soynativo/mobile start`

## Следующие шаги

1. Прочитайте [DEVELOPMENT.md](docs/DEVELOPMENT.md) для детальной информации о разработке
2. Изучите [ARCHITECTURE.md](docs/ARCHITECTURE.md) для понимания архитектуры
3. Проверьте [API.md](docs/API.md) для API документации
4. Начните разработку с создания feature branch

---

**Вопросы?** Смотрите troubleshooting выше или создайте issue на GitHub.

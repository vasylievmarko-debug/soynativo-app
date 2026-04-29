# Soynativo - Language Learning Platform

## 🎯 Current Status

**Last updated:** 2026-04-29
**Active branch:** `claude/language-learning-app-LWdbd`
**Phase:** Phase 2 — Core Features (in progress)

### What's done
- ✅ Phase 1 Foundation: project structure, JWT auth, user roles, DB schema
- ✅ Backend MVP: 17 TS errors resolved, unit tests passing (auth.service)
- ✅ Mobile screens: LoginScreen, LessonsScreen (cursor pagination), ProfileScreen
- ✅ Codespaces dev environment (`.devcontainer/`)
- ✅ Docker Compose for local Postgres + Redis (`docker-compose.yml`)
- ✅ Cross-device Git workflow: SSH keys, scripts/setup-git-macos.sh
- ✅ Local copy on iMac at `~/Projects/soynativo-app`

### Next up
- 🔲 Run migrations + seed in Codespaces (yarn workspace @soynativo/backend migration:run / seed)
- 🔲 Verify A4 (≥18 individual lessons) and A5 (/auth/register returns 404)
- 🔲 Implement BookingsScreen (currently placeholder)
- 🔲 Test full app flow on real iPhone via Expo Go
- 🔲 Google Meet integration
- 🔲 Telegram bot integration

### Known constraints
- Backend `package.json` uses `"type": "module"` → use `jest.config.cjs` (not `.ts`)
- LOG_LEVEL valid values: `debug | info | warn | error` (not `silent`)
- Husky hooks not executable in current sandbox (commits show warning, harmless)

### Devices
- iMac (Marks-iMac) — primary local dev, fully set up
- Codespaces — for iPhone/iPad access via browser
- Cloud Claude session — separate working copy at `/home/user/soynativo-app`

> 💡 Update this section at the end of each session so the next Claude (here or on another device) picks up where we left off.

---

## 📋 Описание проекта

Кроссплатформенное приложение для обучения иностранным языкам (iOS/Android) со следующими функциями:

- **Personal accounts** - Личные кабинеты для учеников, учителей и администраторов
- **Video lessons** - Видеозвонки через Google Meet API
- **Lesson management** - Расписание и управление уроками
- **Booking system** - Бронирование времени с учителем
- **Lesson recordings** - Сохранение и просмотр записей уроков
- **Telegram bot integration** - Уведомления о новых уроках, переносах, бронированиях

## 🛠️ Технологический стек

### Mobile (iOS/Android)
- **React Native** + **Expo** - кроссплатформенная разработка
- **TypeScript** - строгая типизация
- **React Navigation** - навигация
- **Zustand** - state management
- **React Query** - управление API запросами
- **Axios** - HTTP клиент

### Backend
- **Node.js** + **Express.js** - REST API
- **TypeScript** - типизация
- **PostgreSQL** - основная база данных
- **TypeORM** - ORM для работы с БД
- **JWT** - аутентификация
- **Socket.io** - real-time события

### Интеграции
- **Google Meet API** - видеозвонки
- **Telegram Bot API** - уведомления
- **Firebase Cloud Messaging** - push-уведомления

## 📁 Структура проекта

```
soynativo-app/
├── apps/
│   ├── mobile/          # React Native приложение
│   │   ├── src/
│   │   │   ├── screens/       # Экраны
│   │   │   ├── components/    # Компоненты
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # API сервисы
│   │   │   ├── store/         # State management
│   │   │   ├── navigation/    # Навигация
│   │   │   └── App.tsx
│   │   ├── app.json           # Expo конфиг
│   │   └── package.json
│   │
│   └── backend/         # Node.js API сервер
│       ├── src/
│       │   ├── controllers/   # Request handlers
│       │   ├── services/      # Business logic
│       │   ├── routes/        # API маршруты
│       │   ├── database/      # БД конфиги
│       │   ├── middleware/    # Middleware
│       │   ├── types/         # TypeScript типы
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── shared/          # Общие типы и утилиты
│   │   ├── src/
│   │   │   ├── types/        # Shared типы
│   │   │   ├── validators/   # Zod валидаторы
│   │   │   └── utils/        # Общие утилиты
│   │   └── package.json
│   │
│   └── components/      # Переиспользуемые компоненты (будущее)
│
├── docs/
│   ├── ARCHITECTURE.md   # Архитектура
│   ├── DEVELOPMENT.md    # Гайд по разработке
│   ├── API.md           # API документация
│   └── DATABASE.md      # Схема БД
│
├── .github/workflows/
│   └── ci.yml           # GitHub Actions CI/CD
│
├── .vscode/
│   ├── settings.json    # VS Code конфиги
│   └── extensions.json  # Рекомендованные расширения
│
├── package.json         # Root monorepo конфиг
├── SETUP.md            # Инструкция по настройке
├── README.md           # Основная документация
└── CLAUDE.md           # Этот файл
```

## 👥 Роли пользователей

1. **Student (Ученик)**
   - Просмотр доступных уроков
   - Бронирование времени с учителем
   - Просмотр записей уроков
   - Получение уведомлений

2. **Teacher (Учитель)**
   - Создание и управление уроками
   - Проведение видеозвонков
   - Просмотр списка учеников
   - Управление расписанием

3. **Admin (Администратор)**
   - Управление всеми пользователями
   - Управление уроками и бронированиями
   - Просмотр статистики
   - Отправка уведомлений всем пользователям

## 🎯 Основные функции (MVP)

### Phase 1 - Foundation ✅
- [x] Project structure and setup
- [x] Authentication system (JWT)
- [x] User roles and permissions
- [x] Database schema

### Phase 2 - Core Features (WIP)
- [ ] User management (CRUD)
- [ ] Lesson management (create, edit, delete, list)
- [ ] Booking system
- [ ] Google Meet integration
- [ ] Lesson recordings

### Phase 3 - Notifications
- [ ] Telegram bot integration
- [ ] Push notifications
- [ ] Real-time WebSocket events
- [ ] Email notifications

### Phase 4 - Enhancement
- [ ] Search and filters
- [ ] User ratings and reviews
- [ ] Payment integration
- [ ] Advanced analytics

## 🚀 Развертывание (Getting Started)

```bash
# 1. Install dependencies
yarn install

# 2. Set up environment
cp apps/backend/.env.example apps/backend/.env
cp apps/mobile/.env.example apps/mobile/.env

# 3. Start development servers
yarn dev

# Mobile: http://localhost:19006
# Backend: http://localhost:3000
```

Подробнее: [SETUP.md](SETUP.md)

## 📱 Тестирование на iPhone 14 Pro Max

```bash
# Запустить мобильное приложение
cd apps/mobile
yarn start

# Отсканировать QR код в Expo Go на iPhone
```

## 🧪 Testing & Quality

```bash
# Linting
yarn lint

# Type checking
yarn type-check

# Formatting
yarn format

# Tests
yarn test
yarn test:watch
```

## 🔐 Безопасность

- JWT токены для аутентификации
- Валидация входных данных (Zod)
- CORS включен
- Хеширование паролей (bcryptjs)
- Environment переменные для sensitive данных
- Pre-commit hooks для code quality

## 📚 Документация

- **[SETUP.md](SETUP.md)** - Инструкция по первоначальной настройке
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Гайд по разработке и команды
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Архитектура приложения
- **[API.md](docs/API.md)** - API endpoints документация
- **[DATABASE.md](docs/DATABASE.md)** - Схема базы данных

## 🔄 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Develop and test**
   - Write code
   - Run tests and linter
   - Test on iPhone 14 Pro Max

3. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new feature"
   ```

4. **Create Pull Request**
   - Provide clear description
   - Reference related issues
   - Ensure all checks pass

5. **Code Review and Merge**
   - Address feedback
   - Merge to develop branch
   - Deploy to staging

## 🛠️ Useful Commands

```bash
# Development
yarn dev                    # Run both mobile and backend
yarn workspace @soynativo/backend dev
yarn workspace @soynativo/mobile start

# Code quality
yarn lint
yarn format
yarn type-check

# Testing
yarn test
yarn test:watch

# Building
yarn build
yarn workspace @soynativo/mobile build:ios
yarn workspace @soynativo/mobile build:android
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Module not found:**
```bash
rm -rf node_modules && yarn install
```

**Expo issues:**
```bash
cd apps/mobile
yarn install
expo start --clear
```

**Database errors:**
```bash
createdb soynativo
```

## 📞 Contacts

- **Product Owner** - [Team Lead]
- **Lead Developer** - Claude AI
- **Designer** - [You]

## 📄 License

MIT

---

**Last Updated:** 27 Apr 2026
**Version:** 0.1.0
**Status:** Foundation Complete, Core Features In Progress

# 🏗️ Архитектура Soynativo

## Общая структура

```
┌─────────────────────────────────────────────────────────┐
│                   Mobile App (React Native)              │
│  (iOS/Android via Expo)                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ REST API + WebSocket
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Backend (Node.js + Express)                 │
│  ├── Authentication (JWT)                               │
│  ├── Lesson Management                                  │
│  ├── Booking System                                     │
│  ├── Google Meet Integration                            │
│  └── Telegram Bot Integration                           │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
┌───────▼──┐ ┌────▼───┐ ┌───▼────────┐
│PostgreSQL│ │Telegram│ │Google Meet │
│Database  │ │  Bot   │ │   API      │
└──────────┘ └────────┘ └────────────┘
```

## Слои приложения

### 1. Presentation Layer (Mobile)
- React Native компоненты
- Navigation (React Navigation)
- UI/UX логика

### 2. Business Logic Layer
- Custom Hooks
- State Management (Zustand)
- Service Layer

### 3. API Communication
- REST клиент (Axios)
- WebSocket (Socket.io)
- Query Management (React Query)

### 4. Backend Layer
- Express.js серверы
- Route handlers
- Business logic
- Database queries

### 5. Data Layer
- PostgreSQL база данных
- TypeORM ORM
- Database migrations

## Модульная архитектура

### Роли пользователей

```
User
├── Student (Ученик)
│   ├── Может просматривать уроки
│   ├── Может бронировать время с учителем
│   ├── Может смотреть записи
│   └── Получает уведомления
├── Teacher (Учитель)
│   ├── Может создавать уроки
│   ├── Может проводить видеозвонки
│   ├── Может создавать записи
│   └── Получает уведомления о бронировании
└── Admin (Администратор)
    ├── Может управлять пользователями
    ├── Может управлять уроками
    └── Получает уведомления обо всех событиях
```

### Основные сущности

1. **User** - Пользователь системы
2. **Lesson** - Урок с расписанием
3. **Booking** - Бронирование времени
4. **Recording** - Запись урока
5. **Notification** - Уведомление в Telegram

## Безопасность

- JWT токены для аутентификации
- CORS для защиты API
- Валидация данных (Zod)
- Хеширование паролей (bcryptjs)
- Ограничение запросов (rate limiting)

## Интеграции

### Google Meet API
- Создание видеозвонков
- Получение ссылок на встречи
- Управление участниками

### Telegram Bot API
- Отправка уведомлений
- Обработка команд
- Управление подписками

## Масштабируемость

- Monorepo структура для лучшей организации
- Разделение concerns (separation of concerns)
- Переиспользуемые пакеты (shared)
- WebSocket для real-time событий
- Асинхронная обработка уведомлений

## CI/CD Pipeline

```
Push code
    ↓
GitHub Actions
    ├── Lint (ESLint)
    ├── Type Check (TypeScript)
    ├── Test (Jest)
    └── Build
    ↓
Deploy (готово к настройке)
```

## Development Workflow

1. Создать feature branch
2. Разработать функцию
3. Запустить тесты и линтер
4. Создать Pull Request
5. Code Review
6. Merge в develop
7. Deploy в staging
8. Deploy в production

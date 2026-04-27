# 🗄️ Database Schema

## Overview

Используем PostgreSQL с TypeORM для управления базой данных.

## Schema Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password        │
│ firstName       │
│ lastName        │
│ avatar          │
│ role            │
│ status          │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
    ┌────▼────────┐   ┌────▼────────┐   ┌────▼────────┐
    │   Lessons   │   │  Bookings   │   │ Recordings  │
    ├─────────────┤   ├─────────────┤   ├─────────────┤
    │ id (PK)     │   │ id (PK)     │   │ id (PK)     │
    │ teacherId   │   │ studentId   │   │ lessonId    │
    │ title       │   │ lessonId    │   │ url         │
    │ description │   │ status      │   │ duration    │
    │ startTime   │   │ createdAt   │   │ createdAt   │
    │ duration    │   │ updatedAt   │   │ updatedAt   │
    │ maxStudents │   └─────────────┘   └─────────────┘
    │ status      │
    │ googleMeetId│
    │ createdAt   │
    │ updatedAt   │
    └─────────────┘
         │
         └──────┬──────────────┐
                │              │
         ┌──────▼────────┐   ┌─▼───────────────┐
         │ LessonUsers   │   │ Notifications   │
         ├───────────────┤   ├─────────────────┤
         │ lessonId (FK) │   │ id (PK)         │
         │ userId (FK)   │   │ userId (FK)     │
         │ status        │   │ type            │
         └───────────────┘   │ content         │
                             │ telegramSent    │
                             │ createdAt       │
                             └─────────────────┘
```

## Tables

### Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  avatar VARCHAR(500),
  role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  telegramChatId VARCHAR(255),
  notificationsEnabled BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

### Lessons

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacherId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(50) NOT NULL,
  level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
  startTime TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  maxStudents INTEGER DEFAULT 20,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  googleMeetId VARCHAR(255),
  recordingUrl VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_teacherId (teacherId),
  INDEX idx_startTime (startTime),
  INDEX idx_status (status)
);
```

### Bookings

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lessonId UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  studentId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lessonId, studentId),
  INDEX idx_studentId (studentId),
  INDEX idx_lessonId (lessonId),
  INDEX idx_status (status)
);
```

### Recordings

```sql
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lessonId UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  duration INTEGER,
  size INTEGER,
  status ENUM('processing', 'ready', 'failed') NOT NULL DEFAULT 'processing',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lessonId (lessonId)
);
```

### Notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lessonId UUID REFERENCES lessons(id) ON DELETE SET NULL,
  type ENUM('lesson_created', 'lesson_rescheduled', 'booking_confirmed', 'lesson_starting', 'recording_ready') NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  telegramSent BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_createdAt (createdAt),
  INDEX idx_isRead (isRead)
);
```

### LessonUsers (Many-to-Many)

```sql
CREATE TABLE lesson_users (
  lessonId UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('enrolled', 'attended', 'absent') NOT NULL DEFAULT 'enrolled',
  joinedAt TIMESTAMP,
  leftAt TIMESTAMP,
  PRIMARY KEY (lessonId, userId),
  INDEX idx_userId (userId)
);
```

## Constraints & Relationships

- **Users** ← **Lessons** (1:Many) - Один учитель может проводить много уроков
- **Users** ← **Bookings** (1:Many) - Один студент может забронировать много сеансов
- **Lessons** ← **Bookings** (1:Many) - Один урок может быть забронирован много раз
- **Lessons** ← **Recordings** (1:1/1:Many) - Один урок может иметь одну запись
- **Users** ← **Notifications** (1:Many) - Один пользователь может получить много уведомлений
- **Lessons** ↔ **Users** (Many:Many через LessonUsers)

## Indexes для производительности

1. Быстрый поиск по email (authentication)
2. Фильтрация уроков по учителю и времени
3. Поиск бронирований студента
4. Сортировка уведомлений по времени создания

## Миграции

TypeORM управляет миграциями автоматически при изменении entities.

```bash
# Создать миграцию
yarn typeorm migration:create

# Запустить миграции
yarn typeorm migration:run

# Откатить последнюю миграцию
yarn typeorm migration:revert
```

## Data Retention

- **Deleted Users** - Cascade delete (удаляются все связанные записи)
- **Archived Lessons** - Их можно пометить как archived вместо удаления
- **Notifications** - Хранятся 90 дней, затем удаляются

## Performance Notes

- Используются индексы на часто запрашиваемых полях
- Denormalization по мере необходимости (например, cachedStudentCount в Lesson)
- Кэширование результатов запросов (Redis, если добавится)

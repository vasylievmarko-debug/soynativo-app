# 📡 API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.soynativo.com/api
```

## Authentication

Все защищенные эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## Endpoints (WIP)

### Auth
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `POST /auth/refresh` - Обновление токена
- `POST /auth/logout` - Выход

### Users
- `GET /users/me` - Текущий пользователь
- `GET /users/:id` - Профиль пользователя
- `PUT /users/:id` - Обновление профиля
- `GET /users/:id/lessons` - Уроки пользователя

### Lessons
- `GET /lessons` - Список уроков
- `GET /lessons/:id` - Деталь урока
- `POST /lessons` - Создание урока (учитель/админ)
- `PUT /lessons/:id` - Обновление урока
- `DELETE /lessons/:id` - Удаление урока

### Bookings
- `GET /bookings` - Мои бронирования
- `POST /bookings` - Новое бронирование
- `PUT /bookings/:id` - Обновление бронирования
- `DELETE /bookings/:id` - Отмена бронирования
- `GET /bookings/:id/google-meet-link` - Ссылка Google Meet

### Recordings
- `GET /recordings` - Список записей
- `GET /recordings/:id` - Деталь записи
- `POST /recordings` - Создание записи
- `DELETE /recordings/:id` - Удаление записи

### Notifications
- `GET /notifications` - История уведомлений
- `PUT /notifications/:id/read` - Отметить как прочитано

## WebSocket Events

### Client Events (отправляет мобильное приложение)
- `lesson:join` - Присоединиться к уроку
- `lesson:leave` - Покинуть урок
- `lesson:update` - Обновление урока
- `booking:create` - Новое бронирование

### Server Events (отправляет сервер)
- `lesson:started` - Урок начался
- `lesson:finished` - Урок закончился
- `user:notification` - Новое уведомление
- `booking:confirmed` - Бронирование подтверждено

## Error Codes

| Код | Статус | Сообщение |
|-----|--------|-----------|
| 400 | Bad Request | Неверные данные |
| 401 | Unauthorized | Не авторизирован |
| 403 | Forbidden | Нет доступа |
| 404 | Not Found | Не найдено |
| 409 | Conflict | Конфликт данных |
| 500 | Server Error | Ошибка сервера |

## Rate Limiting

- 100 requests/minute для аутентифицированных пользователей
- 10 requests/minute для неаутентифицированных

## Примеры

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "firstName": "Ivan",
  "lastName": "Petrov",
  "role": "student"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "firstName": "Ivan",
    "lastName": "Petrov",
    "role": "student"
  },
  "token": "eyJhbGc..."
}
```

### Get Lessons

```bash
GET /api/lessons?page=1&limit=10
Authorization: Bearer <token>
```

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Spanish A1",
      "description": "Beginner Spanish course",
      "teacherId": "uuid",
      "startTime": "2024-05-01T10:00:00Z",
      "duration": 60,
      "maxStudents": 15,
      "status": "scheduled"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

## Webhooks

### Telegram Notifications

Когда происходит событие, сервер отправляет уведомление в Telegram:

- New Lesson - Новый урок добавлен
- Lesson Rescheduled - Урок перенесен
- Booking Confirmed - Бронирование подтверждено
- Lesson Starting Soon - Урок начнется через 15 минут

## Status Codes (2xx)

- `200 OK` - Успешный запрос
- `201 Created` - Ресурс создан
- `204 No Content` - Успешная операция без содержимого

## Pagination

Для эндпоинтов со списками используется pagination:

```
?page=1&limit=10&sort=-createdAt
```

Response включает:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

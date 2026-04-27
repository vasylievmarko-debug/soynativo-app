# Backend tests

Two layers, run independently:

| Layer       | Speed | Где живут                                 | Запуск                             |
|-------------|-------|-------------------------------------------|------------------------------------|
| Unit        | ms    | `src/**/__tests__/*.test.ts`              | `yarn test --selectProjects unit`  |
| Integration | sec   | `test/integration/*.test.ts` + `*.integration.test.ts` | `yarn test --selectProjects integration` |

## Unit

- Никаких сетевых вызовов, никакой БД.
- Зависимости заменяются **test doubles** (см. `test/doubles/`) — они реализуют публичный контракт класса.
- Используй `makeUser({...overrides})` из `test/fixtures/` вместо ручного построения объектов.

Шаблон:

```ts
const users = new InMemoryUserRepository();
const events = new EventBus();
const sut = new SomeService(users, events);

it('does the thing', async () => {
  users.seed(makeUser({ email: 'x@y.z' }));
  await sut.doIt();
  // assertions
});
```

## Integration

- Поднимают реальный Postgres + Redis (через `docker compose up -d postgres redis`).
- Создают свежую схему один раз (`synchronize(true)` на test DB), чистят таблицы между тестами через `TRUNCATE`.
- Используют `supertest` для HTTP-уровня без реального сокета.

Тестируем endpoint целиком (controller → service → repository → DB), но не отдельные сервисы — для них есть unit.

## Что покрываем

- **Unit:** бизнес-правила, ветвления, edge-cases, ошибки.
- **Integration:** контракт API (status code, shape ответа, авторизация, валидация).
- **E2E (Maestro):** пользовательские сценарии в мобильном приложении (см. `apps/mobile/maestro/`).

## Coverage

Порог в `jest.config.ts`: 70% lines/statements/functions, 60% branches. Это пол, а не цель — критичные модули (auth, payments) держим выше.

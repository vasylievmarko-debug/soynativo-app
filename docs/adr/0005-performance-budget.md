# ADR-0005: Performance budget и стратегия

**Status:** Accepted
**Date:** 2026-04-27

## Context

Скорость = удержание. На образовательной платформе с видеозвонками и бронированиями каждые 100мс задержки = ощутимая просадка retention. Ретрофитить производительность дорого — её надо встроить как ограничение, а не как «оптимизацию по факту».

## Decision

Принимаем **performance budget**. Метрики ниже — не цели, а потолки. PR, превышающий бюджет, не вливается, пока не обоснован или не оптимизирован.

### Backend (p95 при нагрузке 50 RPS на endpoint)

| Endpoint type                       | p50    | p95    | p99    |
|-------------------------------------|--------|--------|--------|
| Auth (`/auth/login`)                | 80ms   | 200ms  | 400ms  |
| Read (single resource)              | 30ms   | 100ms  | 250ms  |
| Read (list, ≤50 items)              | 50ms   | 150ms  | 300ms  |
| Write (create/update)               | 80ms   | 200ms  | 500ms  |
| Сложный запрос (с join'ами)         | 100ms  | 300ms  | 700ms  |

DB query budget: **никаких запросов ≥ 100ms на горячих путях**. Slow-query log включён в dev и stage с порогом 50ms.

### Mobile (iPhone 14 Pro Max, release build)

| Метрика                                         | Бюджет |
|-------------------------------------------------|--------|
| Cold start до первого экрана (TTI)              | < 2.0s |
| Warm start                                       | < 500ms |
| Переход между экранами                          | < 150ms |
| Скролл списков (60 fps удержание)               | ≥ 58 fps p95 |
| Время ответа input при наборе                   | < 16ms |
| Bundle size (JS)                                | < 4 MB |
| Время до интерактивного экрана уроков от login  | < 400ms (с prefetch) |

## Strategy — что встраиваем сразу

### Backend

1. **Cursor-based pagination** для всех списков (`/lessons`, `/bookings`, `/notifications`). OFFSET на больших таблицах деградирует линейно — отказываемся сразу.
2. **Composite indexes** для всех частых запросов. Каждый новый запрос сопровождается `EXPLAIN ANALYZE` в PR-описании, если затрагивает таблицу > 1000 строк.
3. **Cache-aside через Redis** для горячих read'ов (профиль текущего пользователя, список уроков на ближайшие 7 дней). TTL короткий (60s), invalidation на write.
4. **Request timeout** 5s на API-запрос, 2s на внешние интеграции (Google Meet, Telegram). Никаких dangling-запросов.
5. **Server-Timing header** на каждом ответе — клиент и DevTools видят, где ушло время (`db;dur=23, cache;dur=2, total;dur=45`).
6. **Background offload**: всё, что не нужно для синхронного ответа (отправка Telegram, генерация записи, аналитика) — в BullMQ.
7. **Cluster mode** в production — N-1 воркеров на N ядер.
8. **Keep-alive + HTTP/2 ready** на reverse-proxy.
9. **Slow-query log** включён, порог 50ms; ежедневный отчёт в стейджинге.
10. **Connection pool** под p99 нагрузку. Размер = (RPS × средняя длительность запроса) + запас 30%.

### Mobile

1. **`expo-image` вместо `Image`** — нативный кэш на диске + memory cache, поддержка blurhash/thumbhash для placeholder'ов.
2. **`FlashList` (Shopify) или оптимизированный `FlatList`** для всех списков длиной > 20 элементов: `windowSize`, `removeClippedSubviews`, `getItemLayout`, `keyExtractor`.
3. **TanStack Query prefetch** — на тапе ListItem'а уже фетчим деталь экрана, к моменту анимации навигации данные готовы.
4. **Persistent query cache** — `@tanstack/query-async-storage-persister`. После cold start пользователь сразу видит данные из кэша, фон обновляет.
5. **Skeleton screens** вместо spinners на cold load — субъективно ощущается быстрее.
6. **Reanimated 3** для всех анимаций — выполняется на UI thread, не моргает при тяжёлой JS-работе.
7. **Hermes** включён (по умолчанию в Expo SDK 50+).
8. **New Architecture (Fabric/TurboModules)** включён — `newArchEnabled: true` в `app.json`.
9. **Code splitting** — `React.lazy`/dynamic import для редких экранов (admin, recordings player).
10. **Debounce ввода** в формах поиска (250ms), throttle скролла.
11. **`React.memo` + стабильные коллбэки** для item-компонентов в списках.
12. **InteractionManager.runAfterInteractions** для тяжёлой работы после переходов.

## Non-goals (на старте)

- Не делаем CDN для API-кэша — пока есть Redis.
- Не делаем read-replicas БД — пока нагрузка укладывается в одну ноду.
- Не делаем GraphQL persistent queries — REST достаточно.
- Не делаем edge-функции (Cloudflare Workers).

Каждое из этого — отдельный ADR, когда упрёмся в потолок.

## Measurement — как доказываем

- **Backend bench:** `autocannon` в `scripts/bench/` против локального сервера. CI в PR может опционально прогонять (не блокирует).
- **Mobile bench:** Maestro flow с замерами через `recordTiming` + ручное профилирование в Xcode Instruments на iPhone 14 Pro Max.
- **Production:** OTel-метрики (заготовка в `core/observability/`), endpoint `/metrics` с p50/p95/p99 latency по маршруту.
- **Slow query log:** PG `log_min_duration_statement = 50ms` в dev/stage.

## Consequences

**Плюсы:**
- Производительность — measurable, регресс ловится в PR, а не на проде через месяц.
- Архитектурные решения принимаются с пониманием их стоимости.
- Команда говорит на одном языке: «80ms» вместо «быстро/медленно».

**Минусы:**
- Чуть выше initial complexity — пагинация курсорная, кэш-инвалидация явная.
- Нужна культура измерений; PR без `EXPLAIN ANALYZE` для дорогого запроса — не апрувим.

## Когда пересматривать

Пересмотр бюджета при:
- значимом росте нагрузки (10x от текущей);
- появлении новой функции с принципиально другим профилем (например, чат с тысячами сообщений);
- изменении SLA с пользователем (например, премиум-тариф с гарантиями).

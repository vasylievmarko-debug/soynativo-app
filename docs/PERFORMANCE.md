# Performance playbook

> Бюджет и принципы — в [ADR-0005](adr/0005-performance-budget.md). Этот файл — практический гайд: как, чем и где замерять, какие компоненты использовать, какие антипаттерны не допускать.

## Где «обычно» начинаются медленные приложения

| Симптом                                  | Корень                                                         | Профилактика                                       |
|------------------------------------------|----------------------------------------------------------------|---------------------------------------------------|
| Список листает рывками                   | `FlatList` без оптимизаций / тяжёлый item                      | `<List>` (FlashList) + `React.memo` + стабильные коллбэки |
| Холодный старт > 3с                      | Большой JS-бандл, синхронные API на mount                       | persistent React Query, code-splitting, parallel I/O |
| API отвечает 500ms на простой запрос     | N+1 в SQL или missing index                                    | `EXPLAIN ANALYZE` + composite index               |
| Картинки моргают при скролле             | `react-native`'s `Image` без disk-cache                         | `<Image>` (expo-image) с `cachePolicy="memory-disk"` |
| 99-я перцентиль скачет                    | Один тяжёлый запрос блокирует event loop                       | offload в BullMQ; `statement_timeout`             |
| Latency растёт под нагрузкой             | Connection pool слишком маленький                              | `DATABASE_POOL_SIZE` под нагрузку p99             |
| Память течёт                             | Hot-reload в dev, забытые listener'ы, не закрытые transactions | `removeEventListener` в cleanup, AbortController  |

## Backend

### Pagination — только курсорная

```ts
import { paginate, encodeCursor } from '@shared/pagination/cursor';

const qb = repo.createQueryBuilder('l').where('l.status = :s', { s: 'scheduled' });
const page = await paginate(qb, { sortField: 'startTime', cursor, limit: 20 });
// res: { items, nextCursor }
```

OFFSET-пагинация запрещена на любых таблицах, кроме «никогда не вырастет больше 100 строк» (списки enum-значений и т.п.).

### Cache-aside через Redis

```ts
import { CacheService } from '@core/cache/cache.service';
import { CacheKeys, CacheTTL } from '@core/cache/cache-keys';

const lesson = await cache.getOrSet(
  CacheKeys.lesson(id),
  CacheTTL.medium,
  () => repo.findById(id)
);
// На write — bust:
await cache.del(CacheKeys.lesson(id));
```

Правила:
- **TTL короткий.** Не держим что попало по 24 часа — короткая stale window лучше, чем месяц расхождения с БД.
- **Bust на write всегда.** Мутация = `cache.del(...)` после успешного `save`. Если забыл — это инцидент, не «оптимизация».
- **Не кэшируем горячо персонализированное** (история отдельного пользователя), если оно прокручивается чаще, чем читается.

### Server-Timing

В каждом обработчике для дорогих операций:

```ts
const stopDb = req.startTime!('db');
const lesson = await repo.findById(id);
stopDb();

const stopCache = req.startTime!('cache');
await cache.set(...);
stopCache();
```

Заголовок `Server-Timing` придёт в DevTools и логи — мгновенно видно, где время ушло.

### Slow query log

Включён по умолчанию (`maxQueryExecutionTime: 50` в DataSource). Лог уровня WARN с SQL и параметрами при превышении 50ms; добавляет stack trace при ≥ 500ms. На стейджинге — обязательно ставим PG `log_min_duration_statement = 50ms`.

### Indexes

См. `apps/backend/src/core/database/migrations/README.md`. Перед добавлением запроса на горячий путь:

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
```

Если в плане `Seq Scan` на таблице > 1000 строк — добавь индекс или обоснуй в PR-описании, почему scan приемлем.

### Когда выгружать в очередь

В синхронный путь оставляй только то, без чего ответ не имеет смысла. Всё остальное:

✅ Telegram-уведомление о новом уроке → BullMQ
✅ Генерация записи видео → BullMQ
✅ Email-подтверждение бронирования → BullMQ
❌ Создание Google Meet ссылки на старте урока (нужно в ответе) → синхронно, но с timeout 2s

## Mobile

### Списки

Любой список длиной **≥ 20** — через `<List>`:

```tsx
import { List } from '@shared/ui';

<List
  data={lessons}
  estimatedItemSize={72}  // measure once on device
  renderItem={({ item }) => <LessonCard lesson={item} />}
  onEndReached={() => fetchNextPage()}
  onEndReachedThreshold={0.5}
/>
```

Item-компоненты — всегда `React.memo`:

```tsx
const LessonCard = React.memo(function LessonCard({ lesson }: { lesson: Lesson }) { ... });
```

Колбэки, передаваемые в item — через `useStableCallback`, иначе мемо не сработает.

### Изображения

Только через `<Image>` из `@shared/ui` (обёртка над `expo-image`). Передавай `placeholder={{ blurhash: '...' }}` — нет layout shift и видна форма картинки до загрузки. Backend должен возвращать blurhash вместе с URL.

### Skeleton вместо Spinner

Для cold load — `<Skeleton>` или `<SkeletonRow>`. Анимация на UI thread (Reanimated) → не моргает при тяжёлой JS-работе.

### Prefetch на тапе

```tsx
const prefetch = usePrefetch();

<ListItem
  onPressIn={() => prefetch(queryKeys.lessons.byId(id), () => api.getLesson(id))}
  onPress={() => navigation.navigate('Lesson', { id })}
/>
```

Между `pressIn` и `press` (анимация навигации) — данные уже в кэше. Экран ренедрится мгновенно.

### Persistent cache

`PersistQueryClientProvider` уже подключён в `AppProviders`. Cold start → юзер сразу видит то же, что видел в прошлый раз; в фоне refetch обновляет.

⚠️ **Bumpай `buster`** в `AppProviders.tsx` при изменении формы кэшируемых данных. Иначе старый кэш с другими полями попадёт в новый код = крэши.

### Оптимистичные мутации

Для бронирования / лайков / прочитано-непрочитано:

```tsx
useMutation({
  mutationFn: api.bookLesson,
  onMutate: async (lessonId) => {
    await qc.cancelQueries({ queryKey: queryKeys.lessons.byId(lessonId) });
    const prev = qc.getQueryData(queryKeys.lessons.byId(lessonId));
    qc.setQueryData(queryKeys.lessons.byId(lessonId), (old) => ({ ...old, booked: true }));
    return { prev };
  },
  onError: (_err, lessonId, ctx) => {
    qc.setQueryData(queryKeys.lessons.byId(lessonId), ctx?.prev);
  },
  onSettled: (_data, _err, lessonId) => {
    qc.invalidateQueries({ queryKey: queryKeys.lessons.byId(lessonId) });
  },
});
```

Шаблон выше — **обязателен** для всего, что меняет состояние, видимое пользователю.

### Анимации

Только Reanimated 3 (`useSharedValue`, `withTiming`, `useAnimatedStyle`). RN `Animated` — нет: он отскакивает при загруженном JS thread.

### Debounce ввода

```tsx
const [q, setQ] = useState('');
const debouncedQ = useDebounce(q, 250);
const { data } = useQuery({ queryKey: ['search', debouncedQ], ... });
```

## Измерение

### Backend

```bash
# Локально
docker compose up -d
yarn workspace @soynativo/backend dev
yarn workspace @soynativo/backend bench
```

`scripts/bench/run-bench.ts` падает с non-zero exit, если p95 не уложился в бюджет. Можно подвешивать к nightly CI.

### Mobile

1. **Release build на iPhone 14 Pro Max** — мерим только релиз. Dev-mode не показатель.
2. **Xcode Instruments → Time Profiler** для cold start и тяжёлых экранов.
3. **React DevTools Profiler** для re-render hot-spots.
4. **Maestro flow с `recordTiming`** для регрессий по сценариям.

## Чеклист PR

При изменении горячего пути добавь в PR:

- [ ] `EXPLAIN ANALYZE` нового запроса (если есть DB hit).
- [ ] Server-Timing скриншот для новых endpoints.
- [ ] Если добавил кэш — описано, как инвалидируется.
- [ ] Если добавил список / экран — измерил cold start / fps на iPhone 14 Pro Max.
- [ ] Bench не упал (если затронут hot path).

## Ссылки

- [ADR-0005: Performance budget](adr/0005-performance-budget.md)
- [PG: planning queries](https://www.postgresql.org/docs/current/using-explain.html)
- [TanStack Query: performance](https://tanstack.com/query/latest/docs/react/guides/performance-and-request-waterfalls)
- [Reanimated 3 docs](https://docs.swmansion.com/react-native-reanimated/)
- [FlashList migration guide](https://shopify.github.io/flash-list/docs/fundamentals/performant-components)

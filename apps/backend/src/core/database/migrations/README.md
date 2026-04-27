# Database migrations

Все изменения схемы — через миграции. `synchronize: false` в data-source гарантирует, что иначе никак.

## Правила

1. **Никогда не правь существующую миграцию**, если она уже была запущена в любой среде. Создавай новую.
2. **На горячих таблицах (≥ 100k строк) — `CREATE INDEX CONCURRENTLY`.** Иначе блокировка таблицы во время билда индекса = downtime.
   ```ts
   await qr.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_x ON tbl (col)`);
   ```
   `CONCURRENTLY` нельзя в транзакции — TypeORM по умолчанию оборачивает миграцию в одну транзакцию. Отключай через `transaction = false` на классе:
   ```ts
   export class AddIndex1234 implements MigrationInterface {
     transaction = false;
     ...
   }
   ```

3. **Добавление NOT NULL колонки на большой таблице** — три шага в трёх миграциях:
   - добавить nullable;
   - бэкфилл данных батчами (`UPDATE ... WHERE id IN (SELECT id ... LIMIT 1000)` в воркере);
   - `ALTER COLUMN SET NOT NULL` + `SET DEFAULT`.

4. **Перед PR с миграцией:**
   - Запусти на копии прод-данных, замерь время.
   - Включи `EXPLAIN (ANALYZE, BUFFERS)` для нового запроса, который индекс должен ускорить, и приложи к PR.
   - Проверь `pg_stat_user_indexes` через неделю — если индекс не используется, удали его (индекс — это не бесплатно: write amplification + место).

## Composite index ordering

Колонки в составном индексе пиши **по селективности**: equality first, range last.

Хорошо: `(teacherId, startTime)` — `WHERE teacherId = ? AND startTime > ?` использует индекс целиком.
Плохо: `(startTime, teacherId)` — диапазон по startTime блокирует использование teacherId как ключа.

## Partial indexes

Сильное оружие. Если запрос всегда содержит фильтр (`WHERE status = 'scheduled'` или `WHERE deletedAt IS NULL`) — добавь это как `WHERE` в индекс:

```sql
CREATE INDEX idx_lessons_upcoming ON lessons (startTime) WHERE status = 'scheduled';
```

Индекс меньше → быстрее загружается → больше помещается в shared_buffers.

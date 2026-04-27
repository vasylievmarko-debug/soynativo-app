/**
 * Cursor-based pagination. Use this for every list endpoint touching a table
 * that may grow past ~10k rows. OFFSET is rejected on principle — its cost
 * grows linearly with offset and breaks under writes during pagination.
 *
 * Cursor encodes the (sort field value, id) tuple as base64. The id tiebreaker
 * keeps the page boundary stable when many rows share the same sort value
 * (e.g. multiple lessons starting at the same minute).
 *
 *   const page = await paginate(qb, { sortField: 'startTime', cursor, limit: 20 });
 *   // -> { items, nextCursor }
 */
import type { SelectQueryBuilder } from 'typeorm';

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CursorParams {
  sortField: string;
  direction?: 'ASC' | 'DESC';
  cursor?: string;
  limit: number;
}

interface DecodedCursor {
  v: string | number;
  id: string;
}

const MAX_LIMIT = 100;

export function encodeCursor(value: string | number | Date, id: string): string {
  const v = value instanceof Date ? value.toISOString() : value;
  return Buffer.from(JSON.stringify({ v, id })).toString('base64url');
}

export function decodeCursor(token: string): DecodedCursor | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    if (typeof decoded?.id !== 'string') return null;
    return decoded as DecodedCursor;
  } catch {
    return null;
  }
}

export async function paginate<T extends { id: string } & Record<string, unknown>>(
  qb: SelectQueryBuilder<T>,
  { sortField, direction = 'DESC', cursor, limit }: CursorParams
): Promise<CursorPage<T>> {
  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const alias = qb.alias;
  const op = direction === 'DESC' ? '<' : '>';

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      // Compound comparison: (sortField, id) is strictly less/greater than
      // (cursor.v, cursor.id). Postgres supports row constructors directly.
      qb.andWhere(`(${alias}.${sortField}, ${alias}.id) ${op} (:v, :id)`, {
        v: decoded.v,
        id: decoded.id,
      });
    }
  }

  qb.orderBy(`${alias}.${sortField}`, direction).addOrderBy(`${alias}.id`, direction).take(safeLimit + 1);

  const rows = await qb.getMany();
  const items = rows.slice(0, safeLimit);
  const hasMore = rows.length > safeLimit;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last[sortField] as string | number, last.id) : null;

  return { items, nextCursor };
}

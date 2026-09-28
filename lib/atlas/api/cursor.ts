/** Cursor pagination for Atlas list endpoints. Default and maximum page size is 200. */

export const API_PAGE_SIZE = 200;

export class AtlasQueryError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "AtlasQueryError";
  }
}

export function encodeCursor(key: string): string {
  return Buffer.from(key, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): string | null {
  if (!cursor || cursor.length > 512 || !/^[A-Za-z0-9_-]+$/.test(cursor)) return null;
  const text = Buffer.from(cursor, "base64url").toString("utf8");
  if (!text || text.includes("\u0000")) return null;
  if (encodeCursor(text) !== cursor) return null;
  return text;
}

export type CursorPage<T> = {
  items: T[];
  pageSize: number;
  nextCursor: string | null;
};

export function emptyCursorPage<T>(pageSize: number): CursorPage<T> {
  return { items: [], pageSize, nextCursor: null };
}

export type ListQuery = {
  cursor: string | null;
  country: string | null;
  limit: number;
};

export function parseListQuery(url: URL): ListQuery {
  const rawCursor = url.searchParams.get("cursor");
  let cursor: string | null = null;
  if (rawCursor != null && rawCursor !== "") {
    cursor = decodeCursor(rawCursor);
    if (!cursor) throw new AtlasQueryError("invalid_cursor");
  }
  const country = url.searchParams.get("country")?.trim() || null;
  const rawLimit = url.searchParams.get("limit");
  let limit = API_PAGE_SIZE;
  if (rawLimit != null && rawLimit !== "") {
    if (!/^\d+$/.test(rawLimit)) throw new AtlasQueryError("invalid_limit");
    limit = Number(rawLimit);
    if (limit < 1 || limit > API_PAGE_SIZE) throw new AtlasQueryError("invalid_limit");
  }
  return { cursor, country, limit };
}

/** Last key of a limit+1 read. The extra row is only a signal that another page exists. */
export function pageFromRows<T>(rows: T[], limit: number, key: (row: T) => string): CursorPage<T> {
  const items = rows.slice(0, limit);
  const last = items[items.length - 1];
  const nextCursor = rows.length > limit && last ? encodeCursor(key(last)) : null;
  return { items, pageSize: limit, nextCursor };
}

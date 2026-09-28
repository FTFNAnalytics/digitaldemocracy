export const SEARCH_MODES = ["seat", "cycle", "candidate"] as const;
export type SearchMode = (typeof SEARCH_MODES)[number];

export const SEARCH_QUERY_MAX = 200;
export const SEARCH_DEFAULT_LIMIT = 20;
export const SEARCH_API_MAX_LIMIT = 50;

export const SEARCH_LEVELS = [
  { value: "country", label: "Country" },
  { value: "region", label: "Region" },
  { value: "municipality", label: "Municipality" },
  { value: "ward", label: "Ward" },
  { value: "area", label: "Area" },
] as const;

export class SearchInputError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "SearchInputError";
  }
}

export type SearchQuery = {
  mode: SearchMode;
  q: string;
  country?: string;
  level?: string;
  yearFrom?: number;
  yearTo?: number;
  limit: number;
};

function firstValue(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function readParam(
  source: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
): string {
  if (source instanceof URLSearchParams) return source.get(key) ?? "";
  return firstValue(source[key]).trim();
}

function parseMode(value: string): SearchMode {
  if (!value) return "seat";
  if ((SEARCH_MODES as readonly string[]).includes(value)) return value as SearchMode;
  throw new SearchInputError("mode must be seat, cycle, or candidate.");
}

function parseYear(value: string, label: string): number | undefined {
  if (!value) return undefined;
  if (!/^\d{1,4}$/.test(value)) throw new SearchInputError(`${label} must be a year.`);
  const year = Number(value);
  if (year < 1 || year > 9999) throw new SearchInputError(`${label} must be a year.`);
  return year;
}

function parseLimit(value: string, cap: number): number {
  if (!value) return SEARCH_DEFAULT_LIMIT;
  if (!/^\d+$/.test(value)) throw new SearchInputError("limit must be a positive integer.");
  const limit = Number(value);
  if (limit < 1) throw new SearchInputError("limit must be a positive integer.");
  return Math.min(limit, cap);
}

export function parseAtlasSearchParams(
  source: URLSearchParams | Record<string, string | string[] | undefined>,
  options?: { maxLimit?: number },
): SearchQuery {
  const q = readParam(source, "q");
  if (q.length > SEARCH_QUERY_MAX) {
    throw new SearchInputError(`q is limited to ${SEARCH_QUERY_MAX} characters.`);
  }
  const country = readParam(source, "country");
  const level = readParam(source, "level");
  if (country.length > 80) throw new SearchInputError("country is too long.");
  if (level.length > 40) throw new SearchInputError("level is too long.");
  const yearFrom = parseYear(readParam(source, "from"), "from");
  const yearTo = parseYear(readParam(source, "to"), "to");
  if (yearFrom != null && yearTo != null && yearFrom > yearTo) {
    throw new SearchInputError("from must not be later than to.");
  }
  return {
    mode: parseMode(readParam(source, "mode")),
    q,
    country: country || undefined,
    level: level || undefined,
    yearFrom,
    yearTo,
    limit: parseLimit(readParam(source, "limit"), options?.maxLimit ?? SEARCH_API_MAX_LIMIT),
  };
}

export function searchModeLabel(mode: SearchMode): string {
  if (mode === "seat") return "Seats";
  if (mode === "cycle") return "Election days";
  return "Candidates";
}

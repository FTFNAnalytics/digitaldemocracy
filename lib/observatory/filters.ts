export type ExplorerFilterState = {
  q: string;
  region: string;
  country: string;
  area: string;
  tier: string;
  officeType: string;
  dateFrom: string;
  dateTo: string;
  dateCertainty: string;
  evidenceStatus: string;
  metricAvailability: string;
  metricReview: string;
  officeStatus: string;
};

export const EXPLORER_FILTER_KEYS: Array<keyof ExplorerFilterState> = [
  "q",
  "region",
  "country",
  "area",
  "tier",
  "officeType",
  "dateFrom",
  "dateTo",
  "dateCertainty",
  "evidenceStatus",
  "metricAvailability",
  "metricReview",
  "officeStatus",
];

export function emptyExplorerFilters(): ExplorerFilterState {
  return {
    q: "",
    region: "",
    country: "",
    area: "",
    tier: "",
    officeType: "",
    dateFrom: "",
    dateTo: "",
    dateCertainty: "",
    evidenceStatus: "",
    metricAvailability: "",
    metricReview: "",
    officeStatus: "current",
  };
}

export function parseExplorerFilters(
  params: Record<string, string | string[] | undefined>,
): ExplorerFilterState {
  const base = emptyExplorerFilters();
  for (const key of EXPLORER_FILTER_KEYS) {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value != null && value !== "") {
      base[key] = value;
    }
  }
  if (params.officeStatus === undefined) {
    base.officeStatus = "current";
  }
  return base;
}

export function serializeExplorerFilters(
  state: ExplorerFilterState,
  defaults: ExplorerFilterState = emptyExplorerFilters(),
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of EXPLORER_FILTER_KEYS) {
    const value = state[key];
    if (value && value !== defaults[key]) {
      params.set(key, value);
    }
  }
  return params;
}

export type CoverageFilterState = {
  q: string;
  category: string;
  country: string;
};

export function parseCoverageFilters(
  params: Record<string, string | string[] | undefined>,
): CoverageFilterState {
  const first = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  };
  return {
    q: first("q"),
    category: first("category"),
    country: first("country"),
  };
}

export type CalendarFilterState = {
  view: "agenda" | "month";
  month: string;
};

export function parseCalendarFilters(
  params: Record<string, string | string[] | undefined>,
): CalendarFilterState {
  const rawView = Array.isArray(params.view) ? params.view[0] : params.view;
  const rawMonth = Array.isArray(params.month) ? params.month[0] : params.month;
  return {
    view: rawView === "month" ? "month" : "agenda",
    month: rawMonth ?? "",
  };
}

export function parseOfficeListParam(
  raw: string | string[] | undefined,
): string[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return [];
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function parsePollingFilters(
  params: Record<string, string | string[] | undefined>,
): { scope: string; country: string; q: string } {
  const first = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  };
  return {
    scope: first("scope"),
    country: first("country"),
    q: first("q"),
  };
}

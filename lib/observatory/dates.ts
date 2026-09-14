import type { ResearchDate } from "@/schemas/v1/normalized";

/**
 * Format a research date for display. Never invent a day, month, or
 * timezone. Prefer the supplied label.
 */
export function formatResearchDate(date: ResearchDate | undefined | null): string {
  if (!date) return "Date unknown";
  return date.label;
}

export function dateCertaintyLabel(certainty: ResearchDate["certainty"]): string {
  switch (certainty) {
    case "called":
      return "Formally called";
    case "statutory":
      return "Statutory / scheduled";
    case "expected":
      return "Expected (not formally called)";
    case "conditional":
      return "Conditional";
    case "unknown":
      return "Unknown";
  }
}

export function datePrecisionLabel(precision: ResearchDate["precision"]): string {
  switch (precision) {
    case "day":
      return "Day precision";
    case "month":
      return "Month precision — no calendar day supplied";
    case "year":
      return "Year precision";
    case "range":
      return "Date range";
    case "unknown":
      return "Precision unknown";
  }
}

/**
 * Sort key that does not coerce month/year dates to day 1.
 * Month-only sorts after any day-certain date in the same month.
 */
export function researchDateSortKey(date: ResearchDate | undefined | null): number {
  if (!date) return Number.POSITIVE_INFINITY;
  const y = date.year ?? 9999;
  const m = date.month ?? 13;
  const d =
    date.precision === "day" && date.day != null ? date.day : 32;
  return y * 10000 + m * 100 + d;
}

export function isPartialDate(date: ResearchDate): boolean {
  return date.precision !== "day";
}

export function assertNotCoercedToFirstOfMonth(date: ResearchDate): void {
  if (date.precision === "month" && date.day != null) {
    throw new Error(
      `Month-precision date "${date.label}" must not carry a day (got ${date.day}).`,
    );
  }
}

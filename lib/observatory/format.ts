import type { CoverageStatus, NumericValue, ValueStatus } from "@/schemas/v1/normalized";

export function coverageStatusLabel(status: CoverageStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "partial":
      return "Partial";
    case "screened_out":
      return "Screened out (as of dated evidence)";
    case "not_supplied":
      return "Not yet supplied";
    case "fixture_only":
      return "Synthetic fixture only";
  }
}

export function valueStatusLabel(status: ValueStatus): string {
  switch (status) {
    case "recorded":
      return "Recorded";
    case "zero":
      return "Recorded zero";
    case "unknown":
      return "Unknown";
    case "not_applicable":
      return "Not applicable";
    case "structurally_unavailable":
      return "Structurally unavailable";
    case "preliminary":
      return "Preliminary";
    case "disputed":
      return "Disputed";
    case "superseded":
      return "Superseded";
  }
}

export function formatNumeric(value: NumericValue, options?: { suffix?: string }): string {
  if (value.value == null) return valueStatusLabel(value.status);
  if (value.status === "zero") return `0${options?.suffix ?? ""} (recorded zero)`;
  const formatted = Number.isInteger(value.value)
    ? value.value.toLocaleString("en-US")
    : value.value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const suffix = options?.suffix ?? "";
  if (value.status === "recorded") return `${formatted}${suffix}`;
  return `${formatted}${suffix} (${valueStatusLabel(value.status).toLowerCase()})`;
}

export function formatShare(value: NumericValue, unit: "percent_0_100" | "proportion_0_1"): string {
  if (value.value == null) return valueStatusLabel(value.status);
  const pct = unit === "proportion_0_1" ? value.value * 100 : value.value;
  const body = `${pct.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
  if (value.status === "zero") return "0% (recorded zero)";
  if (value.status === "recorded") return body;
  return `${body} (${valueStatusLabel(value.status).toLowerCase()})`;
}

export function officeStatusLabel(status: "current" | "historical"): string {
  return status === "current" ? "Tracked current office" : "Historical office";
}

export function eventKindLabel(kind: string): string {
  switch (kind) {
    case "ordinary":
      return "Ordinary";
    case "special":
      return "Special";
    case "repeated":
      return "Repeated / replacement";
    case "indirect":
      return "Indirect";
    default:
      return kind;
  }
}

export function legalOutcomeLabel(outcome: string): string {
  switch (outcome) {
    case "certified":
      return "Certified";
    case "annulled":
      return "Annulled";
    case "preliminary":
      return "Preliminary / not yet held";
    case "disputed":
      return "Disputed";
    case "superseded":
      return "Superseded";
    default:
      return outcome;
  }
}

export function unknownCountLabel(known: number, unknownLabel = "unknown"): string {
  return `${known.toLocaleString("en-US")} recorded · remainder ${unknownLabel}`;
}

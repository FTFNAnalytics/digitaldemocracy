import type { AtlasCoverageSnapshot } from "./types";

export const NOT_SUPPLIED = "not supplied";

export function present(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function statusPhrase(status: string | null | undefined): string {
  if (!status || status === "unknown" || status === "structurally_unavailable") return NOT_SUPPLIED;
  const words = status.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function missingOrStatus(
  value: string | number | null | undefined,
  status?: string | null,
): string {
  if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString();
  if (typeof value === "string" && value.trim() !== "") return value;
  return statusPhrase(status);
}

export function storedCoverageLabel(status: string | null | undefined): string {
  if (!status) return "Not supplied";
  if (status === "available") return "Results on file";
  if (status === "partial") return "Partial";
  if (status === "screened_out") return "Screened out";
  if (status === "not_supplied") return "Not supplied";
  return statusPhrase(status);
}

export function listingRoleLabel(role: string): string {
  if (role === "none") return "Upcoming";
  if (role === "selected") return "Recorded result";
  if (role === "other") return "Other listing";
  return statusPhrase(role);
}

export function shareUnitLabel(unit: string | null | undefined): string {
  if (!unit || !unit.trim()) return NOT_SUPPLIED;
  if (unit === "percent_0_100") return "Percent";
  if (unit === "proportion_0_1") return "Proportion";
  return statusPhrase(unit);
}

export function shareLabel(share: number | null, status: string, unit?: string | null): string {
  if (share == null) return statusPhrase(status);
  if (unit === "percent_0_100") return `${share}%`;
  if (unit === "proportion_0_1") return `${share} proportion`;
  return String(share);
}

export function coverageState(
  coverage: AtlasCoverageSnapshot | null | undefined,
): "not_supplied" | "queued" | "partial" | "recorded" {
  if (coverage == null || coverage.offices == null || coverage.officesWithResults == null) {
    return "not_supplied";
  }
  if (coverage.offices <= 0) return "not_supplied";
  if (coverage.officesWithResults <= 0) return "queued";
  if (coverage.officesWithResults < coverage.offices) return "partial";
  return "recorded";
}

export function coverageStateLabel(state: "not_supplied" | "queued" | "partial" | "recorded"): string {
  if (state === "queued") return "Not yet ingested";
  if (state === "partial") return "Partial results";
  if (state === "recorded") return "Results on file";
  return "Not supplied";
}

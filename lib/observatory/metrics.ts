import type { MetricReviewStatus, NumericValue } from "@/schemas/v1/normalized";

export const CI_METHOD_VERSION = "ci.weighted-gap.v1";
export const PEDERSEN_METHOD_VERSION = "pedersen.grouped.v1";

/**
 * Documented competition index. Gaps are top-two gaps in percentage points,
 * latest first.
 *
 * weighted_gap = 0.6 × latest + 0.3 × previous + 0.1 × oldest
 * CI = max(0, 100 × (1 − weighted_gap / 20))
 *
 * Higher values mean closer historical competition under this formula, not a
 * probability of a change in government.
 */
export function competitionIndex(gapsPpLatestFirst: [number, number, number]): number {
  const [latest, previous, oldest] = gapsPpLatestFirst;
  const weightedGap = 0.6 * latest + 0.3 * previous + 0.1 * oldest;
  return Math.max(0, 100 * (1 - weightedGap / 20));
}

/**
 * Grouped Pedersen volatility in percentage points:
 * 0.5 × sum(|group_share_t − group_share_previous|).
 * Lower bound where residual groups conceal internal change.
 */
export function groupedPedersen(shareT: number[], sharePrevious: number[]): number {
  if (shareT.length !== sharePrevious.length) {
    throw new Error("Pedersen intervals require aligned group share vectors.");
  }
  const sum = shareT.reduce(
    (acc, value, i) => acc + Math.abs(value - sharePrevious[i]!),
    0,
  );
  return 0.5 * sum;
}

export function metricBadgeLabel(status: MetricReviewStatus): string {
  switch (status) {
    case "cleared":
      return "Cleared CI";
    case "provisional":
      return "Provisional imported-series CI";
    case "withheld":
      return "Withheld";
    case "ineligible":
      return "Ineligible";
  }
}

export function isClearedMetric(args: {
  reviewStatus: MetricReviewStatus;
  scoreGate: boolean | null;
}): boolean {
  return args.reviewStatus === "cleared" && args.scoreGate === true;
}

/**
 * Convert share values using an explicit field contract.
 * History party `share` may be 0–100 while office `shares` inputs are 0–1.
 */
export function toPercent(
  value: number,
  unit: "percent_0_100" | "proportion_0_1",
): number {
  if (unit === "proportion_0_1") return value * 100;
  return value;
}

export function numericSortKey(value: NumericValue): number {
  if (value.value == null) return Number.POSITIVE_INFINITY;
  return value.value;
}

export function isRecordedZero(value: NumericValue): boolean {
  return value.status === "zero" && value.value === 0;
}

export function isMissing(value: NumericValue): boolean {
  return value.value == null;
}

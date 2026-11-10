import { coverageState, coverageStateLabel, storedCoverageLabel } from "./labels";
import type { AtlasCoverageSnapshot } from "./types";

export function CoverageChip({
  coverage,
  storedStatus,
}: {
  coverage?: AtlasCoverageSnapshot | null;
  storedStatus?: string | null;
}) {
  const label = coverage != null ? coverageStateLabel(coverageState(coverage)) : storedCoverageLabel(storedStatus);
  const state = coverage != null ? coverageState(coverage) : storedStatus === "not_supplied" || !storedStatus ? "not_supplied" : storedStatus;
  return (
    <span
      data-atlas-coverage-chip={state}
      className="inline-flex rounded-full border border-atlas-line bg-atlas-card px-2.5 py-0.5 text-xs font-semibold text-atlas-ink"
    >
      {label}
    </span>
  );
}

export function CoverageBar({ coverage }: { coverage: AtlasCoverageSnapshot | null }) {
  const state = coverageState(coverage);
  const label = coverageStateLabel(state);
  const counted = state === "partial" || state === "recorded" ? coverage : null;
  if (
    counted == null ||
    counted.offices == null ||
    counted.officesWithResults == null ||
    counted.offices <= 0 ||
    counted.officesWithResults <= 0
  ) {
    return (
      <p className="text-sm text-atlas-ink-2" data-atlas-coverage-bar={state}>
        {label}
      </p>
    );
  }

  const width = Math.max(0, Math.min(100, (counted.officesWithResults / counted.offices) * 100));
  return (
    <div data-atlas-coverage-bar={state}>
      <div className="flex justify-between gap-3 text-xs text-atlas-ink-2">
        <span>{label}</span>
        <span>
          {counted.officesWithResults.toLocaleString()} of {counted.offices.toLocaleString()} offices with results
        </span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-atlas-map-none"
        role="meter"
        aria-label="Offices with results"
        aria-valuemin={0}
        aria-valuemax={counted.offices}
        aria-valuenow={counted.officesWithResults}
        aria-valuetext={label}
      >
        <div className="h-2 bg-atlas-accent" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

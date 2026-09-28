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
  if (
    state === "not_supplied" ||
    coverage == null ||
    coverage.offices == null ||
    coverage.officesWithResults == null ||
    coverage.offices <= 0
  ) {
    return (
      <p className="text-sm text-atlas-ink-2" data-atlas-coverage-bar="not_supplied">
        {label}
      </p>
    );
  }

  const width = Math.max(0, Math.min(100, (coverage.officesWithResults / coverage.offices) * 100));
  return (
    <div data-atlas-coverage-bar={state}>
      <div className="flex justify-between gap-3 text-xs text-atlas-ink-2">
        <span>{label}</span>
        <span>
          {coverage.officesWithResults.toLocaleString()} of {coverage.offices.toLocaleString()} offices with results
        </span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-atlas-map-none"
        role="meter"
        aria-label="Offices with results"
        aria-valuemin={0}
        aria-valuemax={coverage.offices}
        aria-valuenow={coverage.officesWithResults}
        aria-valuetext={label}
      >
        <div
          className={state === "queued" ? "h-2 border border-dashed border-atlas-ink-2 bg-transparent" : "h-2 bg-atlas-accent"}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

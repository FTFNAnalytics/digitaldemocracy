import { NOT_SUPPLIED } from "./labels";

export type CycleSharePoint = {
  id: string;
  label: string;
  share: number | null;
  shareUnit: string | null;
};

function shareText(share: number | null, unit: string | null): string {
  if (share == null) return NOT_SUPPLIED;
  if (unit === "percent_0_100") return `${share}%`;
  if (unit === "proportion_0_1") return `${share} proportion`;
  return String(share);
}

export function CycleShareChart({ points }: { points: CycleSharePoint[] }) {
  if (points.length === 0) return null;
  const supplied = points.filter((point) => point.share != null && point.share > 0);
  const units = new Set(supplied.map((point) => point.shareUnit));
  const scaleUnit = units.size === 1 ? supplied[0]?.shareUnit ?? null : null;
  const scale =
    scaleUnit == null
      ? null
      : Math.max(...supplied.filter((point) => point.shareUnit === scaleUnit).map((point) => point.share as number));

  return (
    <ul className="space-y-3" data-atlas-cycle-chart="true">
      {points.map((point) => {
        const missing = point.share == null;
        const width =
          !missing && scale != null && scale > 0 && point.shareUnit === scaleUnit
            ? Math.max(0, Math.min(100, ((point.share as number) / scale) * 100))
            : 0;
        return (
          <li key={point.id} className="grid grid-cols-[7rem_minmax(0,1fr)_6rem] items-center gap-3 text-sm">
            <span className="text-atlas-ink">{point.label}</span>
            {missing ? (
              <span
                data-placeholder="true"
                className="block h-3 rounded-full border border-dashed border-atlas-ink-2 bg-transparent"
                aria-hidden="true"
              />
            ) : (
              <span className="block h-3 rounded-full bg-atlas-map-none" aria-hidden="true">
                <span className="block h-3 rounded-full bg-atlas-accent" style={{ width: `${width}%` }} />
              </span>
            )}
            <span className="text-right text-atlas-ink">{shareText(point.share, point.shareUnit)}</span>
          </li>
        );
      })}
    </ul>
  );
}

import Link from "next/link";
import { CoverageBar } from "./coverage";
import { MapSlot } from "./map-slot";
import type { JurisdictionChild } from "./types";

export type PlaceFilter = {
  q: string;
  kind: string;
  kinds: string[];
  path: string;
  show: boolean;
  date?: string;
};

function filterHref(filter: PlaceFilter, kind: string): string {
  const params = new URLSearchParams();
  if (filter.q) params.set("q", filter.q);
  if (kind && kind !== "all") params.set("kind", kind);
  if (filter.date) params.set("date", filter.date);
  const query = params.toString();
  return query ? `${filter.path}?${query}` : filter.path;
}

export function ChildrenList({ places, filter }: { places: JurisdictionChild[]; filter: PlaceFilter }) {
  const selected = filter.kind || "all";
  return (
    <MapSlot>
      {filter.show ? (
        <div className="mb-3 space-y-2">
          <form method="get" action={filter.path} className="flex flex-wrap items-end gap-2">
            {filter.date ? <input type="hidden" name="date" value={filter.date} /> : null}
            {filter.kind ? <input type="hidden" name="kind" value={filter.kind} /> : null}
            <label className="block min-w-48 flex-1 text-sm text-atlas-ink">
              <span className="mb-1 block font-semibold">Filter places</span>
              <input
                type="search"
                name="q"
                defaultValue={filter.q}
                className="w-full rounded-xl border border-atlas-line bg-atlas-card px-3 py-2 text-atlas-ink"
              />
            </label>
            <button
              type="submit"
              className="rounded-full border border-atlas-line bg-atlas-card px-3 py-2 text-sm font-semibold text-atlas-ink"
            >
              Apply
            </button>
          </form>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Place types">
            <KindLink label="All" href={filterHref(filter, "all")} pressed={selected === "all"} />
            {filter.kinds.map((kind) => (
              <KindLink
                key={kind}
                label={kind.charAt(0).toUpperCase() + kind.slice(1)}
                href={filterHref(filter, kind)}
                pressed={selected === kind}
              />
            ))}
          </div>
        </div>
      ) : null}
      <ul aria-label="Places" className="space-y-2">
        {places.length === 0 ? (
          <li className="text-sm text-atlas-ink-2">No places match this filter.</li>
        ) : (
          places.map((place) => (
            <li key={place.id} className="rounded-xl border border-atlas-line bg-atlas-card px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={place.href} className="font-semibold text-atlas-accent hover:underline">
                  {place.name}
                </Link>
                <span className="rounded-full border border-atlas-line px-2 py-0.5 text-xs text-atlas-ink">{place.level}</span>
              </div>
              <div className="mt-2">
                <CoverageBar coverage={place.coverage} />
              </div>
            </li>
          ))
        )}
      </ul>
    </MapSlot>
  );
}

function KindLink({ label, href, pressed }: { label: string; href: string; pressed: boolean }) {
  return (
    <Link
      href={href}
      aria-current={pressed ? "true" : undefined}
      className={
        pressed
          ? "rounded-full border border-atlas-accent bg-atlas-tint px-2.5 py-0.5 text-xs font-semibold text-atlas-ink"
          : "rounded-full border border-atlas-line bg-atlas-card px-2.5 py-0.5 text-xs font-semibold text-atlas-ink"
      }
    >
      {label}
    </Link>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CoverageBar } from "./coverage";
import { MapSlot } from "./map-slot";
import type { JurisdictionChild } from "./types";

export function ChildrenPanel({ places }: { places: JurisdictionChild[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const showFilters = places.length > 12;
  const kinds = useMemo(
    () => [...new Set(places.map((place) => place.kind).filter((value): value is string => Boolean(value)))].sort(),
    [places],
  );
  const visible = places.filter((place) => {
    if (!showFilters) return true;
    const needle = query.trim().toLowerCase();
    if (needle && !place.name.toLowerCase().includes(needle)) return false;
    if (kind !== "all" && place.kind !== kind) return false;
    return true;
  });

  return (
    <MapSlot>
      {showFilters ? (
        <div className="mb-3 space-y-2">
          <label className="block text-sm text-atlas-ink">
            <span className="mb-1 block font-semibold">Filter places</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-atlas-line bg-atlas-card px-3 py-2 text-atlas-ink"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Place types">
            <TypeChip label="All" pressed={kind === "all"} onClick={() => setKind("all")} />
            {kinds.map((value) => (
              <TypeChip key={value} label={value} pressed={kind === value} onClick={() => setKind(value)} />
            ))}
          </div>
        </div>
      ) : null}
      <ul aria-label="Places" className="space-y-2">
        {visible.length === 0 ? (
          <li className="text-sm text-atlas-ink-2">No places match this filter.</li>
        ) : (
          visible.map((place) => (
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

function TypeChip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? "rounded-full border border-atlas-accent bg-atlas-tint px-2.5 py-0.5 text-xs font-semibold text-atlas-ink"
          : "rounded-full border border-atlas-line bg-atlas-card px-2.5 py-0.5 text-xs font-semibold text-atlas-ink"
      }
    >
      {label}
    </button>
  );
}

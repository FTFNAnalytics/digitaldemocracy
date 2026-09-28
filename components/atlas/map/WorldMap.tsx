import { ATTRIBUTIONS } from "@/lib/atlas/boundaries/attribution";
import type { WorldMarker } from "@/lib/atlas/map/world";
import { WORLD_LAND } from "@/lib/atlas/map/world";

function markerFill(marker: WorldMarker): string {
  if (marker.paint === "not_ingested") return "url(#atlas-world-not-ingested)";
  return `var(--atlas-coverage-${marker.paint})`;
}

/**
 * Static world index. No MapLibre. Land is simplified Natural Earth; markers use derived counts.
 */
export function WorldMap({ markers }: { markers: WorldMarker[] }) {
  return (
    <figure data-atlas-world-map="svg" className="mt-8 rounded-2xl border border-atlas-line bg-atlas-card p-4">
      <figcaption className="mb-3 text-sm text-atlas-ink-2">
        Marker size follows result rows on file. Colour follows coverage.
      </figcaption>
      <svg
        viewBox={WORLD_LAND.viewBox}
        role="img"
        aria-label="World map"
        className="h-auto w-full bg-atlas-map"
      >
        <defs>
          <pattern id="atlas-world-not-ingested" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="var(--atlas-map-none)" />
            <path d="M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6" stroke="var(--atlas-ink-2)" strokeWidth="1" />
          </pattern>
        </defs>
        <path d={WORLD_LAND.land} fill="var(--atlas-map-none)" stroke="var(--atlas-line)" strokeWidth="0.4" />
        {markers.map((marker) => (
          <a key={marker.countryId} href={marker.href}>
            <circle
              cx={marker.x}
              cy={marker.y}
              r={marker.radius}
              fill={markerFill(marker)}
              stroke="var(--atlas-ink)"
              strokeWidth="0.6"
              data-atlas-country={marker.countryId}
              data-atlas-result-rows={marker.resultRows}
              data-atlas-coverage={marker.coverageState}
            >
              <title>{`${marker.name}, ${marker.resultRows} result rows`}</title>
            </circle>
          </a>
        ))}
      </svg>
      <p data-atlas-attribution="natural-earth" className="mt-2 text-xs text-atlas-ink-2">
        {ATTRIBUTIONS.natural_earth}
      </p>
    </figure>
  );
}

import { ATTRIBUTIONS } from "../boundaries/attribution";
import { coverageState, coverageStateLabel, NOT_SUPPLIED } from "@/components/atlas/labels";
import type { AtlasCoverageSnapshot } from "@/components/atlas/types";

/**
 * Coverage steps mix the accent token into the map ground.
 * Adjacent mixes differ by at least 12 percentage points.
 */
export const COVERAGE_STEP_MIX = [18, 40, 64, 88] as const;

export const INLINE_SVG_MAX_SHAPES = 100;

export const EUROPE_LAU_PMTILES_URL = "/atlas/geo/europe-lau.pmtiles";

export type MapRenderer = "empty" | "svg" | "maplibre" | "pmtiles";

export type MapLayerId = "navigate" | "coverage" | "next_election" | "turnout" | "margin";

export type MapPlace = {
  id: string;
  name: string;
  href: string;
  /** Reader label, for the tooltip. */
  level: string;
  /** Raw derived level, for the SVG-vs-MapLibre choice. */
  levelKey: string;
  seatsTracked: number | null;
  firstEventYear: number | null;
  lastEventYear: number | null;
  coverage: AtlasCoverageSnapshot | null;
  nextDateId: string | null;
  nextYear: number | null;
  turnout: number | null;
  margin: number | null;
  marginUnit: string | null;
};

export type TooltipField = {
  id: "name" | "level" | "seats" | "span" | "coverage";
  label: string;
  value: string;
};

export type LayerControl = {
  id: MapLayerId;
  label: string;
  enabled: boolean;
  note: string | null;
};

export type NextElectionBucket = "not_supplied" | "overdue" | "this_year" | "next_year" | "later";

export type CoveragePaint = "not_ingested" | 1 | 2 | 3 | 4;

/** A colon in an OV-01 key becomes an underscore in the OV-07 file name. */
export function topojsonUrlForParent(parentKey: string): string {
  const fileName = parentKey.replace(/:/g, "_");
  if (!/^[A-Za-z0-9._-]+$/.test(fileName)) {
    throw new Error(`parent jurisdiction_key cannot be a file name: ${parentKey}`);
  }
  return `/atlas/geo/${fileName}.json`;
}

/**
 * Jurisdiction views load one TopoJSON file. PMTiles is the Europe-wide zoom only.
 */
export function geometryUrl(args: { scope: "jurisdiction" | "europe"; parentKey?: string | null }): string | null {
  if (args.scope === "europe") return EUROPE_LAU_PMTILES_URL;
  if (!args.parentKey) return null;
  return topojsonUrlForParent(args.parentKey);
}

export function chooseMapRenderer(args: {
  parentLevel: string;
  childLevels: readonly string[];
  approvedShapeCount: number;
  scope?: "jurisdiction" | "europe";
}): MapRenderer {
  if (args.scope === "europe") return "pmtiles";
  if (args.approvedShapeCount <= 0) return "empty";
  const parent = args.parentLevel.trim().toLowerCase();
  const otherTier = args.childLevels.some((level) => {
    const key = level.trim().toLowerCase();
    return key !== "" && key !== "country" && key !== "region" && key !== "municipality";
  });
  if (parent === "municipality" && otherTier && args.approvedShapeCount < INLINE_SVG_MAX_SHAPES) return "svg";
  return "maplibre";
}

export function coverageMixGaps(steps: readonly number[] = COVERAGE_STEP_MIX, minGap = 12): boolean {
  if (steps.length < 2) return false;
  for (let index = 1; index < steps.length; index += 1) {
    if (steps[index]! - steps[index - 1]! < minGap) return false;
  }
  return true;
}

export function coveragePaint(coverage: AtlasCoverageSnapshot | null | undefined): CoveragePaint {
  const state = coverageState(coverage);
  if (state === "not_supplied" || state === "queued" || coverage == null || coverage.offices == null || coverage.offices <= 0) {
    return "not_ingested";
  }
  const withResults = coverage.officesWithResults ?? 0;
  if (withResults <= 0) return "not_ingested";
  const ratio = withResults / coverage.offices;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function nextElectionBucket(year: number | null | undefined, asOfYear: number): NextElectionBucket {
  if (year == null || !Number.isFinite(year)) return "not_supplied";
  if (year < asOfYear) return "overdue";
  if (year === asOfYear) return "this_year";
  if (year === asOfYear + 1) return "next_year";
  return "later";
}

export function resultsSpanLabel(first: number | null | undefined, last: number | null | undefined): string {
  if (first == null && last == null) return NOT_SUPPLIED;
  if (first != null && last != null && first !== last) return `${first}–${last}`;
  return String(first ?? last);
}

export function tooltipFields(place: MapPlace): TooltipField[] {
  return [
    { id: "name", label: "Name", value: place.name },
    { id: "level", label: "Level", value: place.level },
    {
      id: "seats",
      label: "Seats tracked",
      value: place.seatsTracked == null ? NOT_SUPPLIED : String(place.seatsTracked),
    },
    { id: "span", label: "Results span", value: resultsSpanLabel(place.firstEventYear, place.lastEventYear) },
    { id: "coverage", label: "Coverage", value: coverageStateLabel(coverageState(place.coverage)) },
  ];
}

/** Enter activates a shape link. The links are in tab order. */
export function keyboardOpensShape(key: string): boolean {
  return key === "Enter";
}

export function webglAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function sameMarginUnit(places: readonly MapPlace[]): string | null {
  const units = new Set(
    places.filter((place) => place.margin != null && place.marginUnit).map((place) => place.marginUnit as string),
  );
  if (units.size !== 1) return null;
  return [...units][0] ?? null;
}

export function layerControls(places: readonly MapPlace[]): LayerControl[] {
  const turnout = places.some((place) => place.turnout != null);
  const marginUnit = sameMarginUnit(places);
  return [
    { id: "navigate", label: "Navigate", enabled: true, note: null },
    { id: "coverage", label: "Coverage", enabled: true, note: null },
    { id: "next_election", label: "Next election", enabled: true, note: null },
    { id: "turnout", label: "Turnout", enabled: turnout, note: turnout ? null : NOT_SUPPLIED },
    { id: "margin", label: "Margin", enabled: marginUnit != null, note: marginUnit != null ? null : NOT_SUPPLIED },
  ];
}

export function marginUnitForLayer(places: readonly MapPlace[]): string | null {
  return sameMarginUnit(places);
}

export type MetricStep = "not_supplied" | 1 | 2 | 3 | 4;

/** Four bands of a supplied 0–100 (or 0–1 proportion) value. Null stays not supplied. */
export function metricStep(value: number | null | undefined, unit: "percent" | "proportion"): MetricStep {
  if (value == null || !Number.isFinite(value)) return "not_supplied";
  const scale = unit === "proportion" ? 1 : 100;
  const ratio = value / scale;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function nextElectionStep(bucket: NextElectionBucket): MetricStep {
  if (bucket === "not_supplied") return "not_supplied";
  if (bucket === "overdue") return 1;
  if (bucket === "this_year") return 2;
  if (bucket === "next_year") return 3;
  return 4;
}

export function shapePaint(place: MapPlace, layer: MapLayerId, asOfYear: number): CoveragePaint | MetricStep {
  if (layer === "navigate") return 1;
  if (layer === "coverage") return coveragePaint(place.coverage);
  if (layer === "next_election") return nextElectionStep(nextElectionBucket(place.nextYear, asOfYear));
  if (layer === "turnout") return metricStep(place.turnout, "percent");
  const unit = place.marginUnit === "proportion_0_1" ? "proportion" : "percent";
  return metricStep(place.margin, unit);
}

export function boundaryAttribution(source: string | null | undefined): string | null {
  if (source === "gisco_nuts") return ATTRIBUTIONS.gisco_nuts;
  if (source === "gisco_lau") return ATTRIBUTIONS.gisco_lau;
  if (source === "geoboundaries") return ATTRIBUTIONS.geoboundaries;
  if (source === "natural_earth") return ATTRIBUTIONS.natural_earth;
  return null;
}

export const COVERAGE_LEGEND = [
  { step: 1 as const, mix: COVERAGE_STEP_MIX[0], label: "Up to 25% of offices with results" },
  { step: 2 as const, mix: COVERAGE_STEP_MIX[1], label: "Up to 50% of offices with results" },
  { step: 3 as const, mix: COVERAGE_STEP_MIX[2], label: "Up to 75% of offices with results" },
  { step: 4 as const, mix: COVERAGE_STEP_MIX[3], label: "More than 75% of offices with results" },
] as const;

export const NEXT_ELECTION_LEGEND = [
  { step: "not_supplied" as const, label: "Not supplied" },
  { step: 1 as const, label: "Overdue" },
  { step: 2 as const, label: "This year" },
  { step: 3 as const, label: "Next year" },
  { step: 4 as const, label: "Later" },
] as const;

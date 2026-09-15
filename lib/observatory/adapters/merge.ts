import type { NormalizedDataset, RegionRecord } from "../../../schemas/v1/normalized";
import { recomputeCounts } from "./europe";

const ARRAY_FIELDS = [
  "countries",
  "geographies",
  "offices",
  "events",
  "proceedings",
  "partyMappings",
  "officeholders",
  "registers",
  "polls",
  "metrics",
  "sources",
  "issues",
  "completionQueue",
  "artifacts",
] as const;

function applyRegionCoverage(dataset: NormalizedDataset) {
  const europeCount = dataset.countries.filter((c) => c.regionId === "europe").length;
  const oceaniaCount = dataset.countries.filter((c) => c.regionId === "oceania").length;
  dataset.regions = dataset.regions.map((region): RegionRecord => {
    if (region.id === "europe") {
      return {
        ...region,
        status: europeCount > 0 ? "partial" : "not_supplied",
        notes:
          europeCount > 0
            ? "Standalone European country and territory packages are ingested with remaining evidence gaps. Russia is excluded. This is not a complete European register and must not be read as Latin America completeness."
            : region.notes,
      };
    }
    if (region.id === "new-zealand") {
      if (oceaniaCount === 0) return region;
      return {
        id: "oceania",
        name: "Oceania",
        status: "partial",
        isDefaultLanding: false,
        notes:
          "New Zealand initial by-election research only. Australia remains a separate not-yet-supplied region. Not a complete Oceania register.",
      };
    }
    if (region.id === "australia" || region.id === "japan") {
      return {
        ...region,
        status: "not_supplied",
        notes:
          region.notes ||
          "No standalone country package is integrated for this region yet.",
      };
    }
    return region;
  });
}

export function mergeCountryPackages(
  latin: NormalizedDataset,
  extras: NormalizedDataset[],
): NormalizedDataset {
  if (extras.length === 0) return latin;
  const merged: NormalizedDataset = {
    ...latin,
    release: {
      ...latin.release,
      provenance: { ...latin.release.provenance },
      window: { ...latin.release.window },
      validatedCounts: { ...latin.release.validatedCounts },
    },
    regions: latin.regions.map((region) => ({ ...region })),
  };
  const latinBriefings = latin.release.validatedCounts.briefings;
  for (const field of ARRAY_FIELDS) {
    merged[field] = [
      ...(latin[field] as never[]),
      ...extras.flatMap((extra) => extra[field] as never[]),
    ] as never;
  }
  applyRegionCoverage(merged);
  const slugs = extras
    .map((extra) => extra.release.provenance.packageName)
    .filter(Boolean);
  merged.release.provenance.notes = [
    latin.release.provenance.notes,
    `Merged standalone country packages (${slugs.join(", ")}). Package coverage stays partial and is not added into Latin America completeness claims.`,
  ]
    .filter(Boolean)
    .join(" ");
  recomputeCounts(merged);
  merged.release.validatedCounts.briefings =
    latinBriefings +
    extras.reduce((n, extra) => n + extra.release.validatedCounts.briefings, 0);
  merged.release.researchCoverageComplete = false;
  return merged;
}

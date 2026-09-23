import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const PHASE0_SLUGS = new Set([
  "albania",
  "andorra",
  "alderney",
  "armenia",
  "austria",
  "belgium",
  "bosnia-and-herzegovina",
  "bulgaria",
  "netherlands",
  "switzerland",
  "denmark",
  "sweden",
  "finland",
  "norway",
  "ireland",
  "poland",
  "czechia",
  "croatia",
  "portugal",
  "spain",
  "estonia",
  "latvia",
  "hungary",
  "romania",
  "greece",
  "luxembourg",
  "france",
  "cyprus",
  "malta",
  "lithuania",
  "slovakia",
]);

export type ContinuityTierPack = {
  countryId: string;
  lineageId: string;
  status: string;
  path: string;
  officeCount: number;
  focusedReviews: number;
};

export function listContinuityTierPacks(root: string): ContinuityTierPack[] {
  const dir = path.join(root, "schemas/atlas/tiers");
  const packs: ContinuityTierPack[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".json")) continue;
    const countryId = name.slice(0, -".json".length);
    if (PHASE0_SLUGS.has(countryId)) continue;
    const rel = `schemas/atlas/tiers/${name}`;
    const parsed = JSON.parse(readFileSync(path.join(root, rel), "utf8")) as {
      country_id?: string;
      country_slug?: string;
      lineage_id?: string;
      status?: string;
      classifications?: Array<{ human_review_required?: boolean }>;
    };
    const classifications = parsed.classifications ?? [];
    packs.push({
      countryId: parsed.country_id ?? parsed.country_slug ?? countryId,
      lineageId: String(parsed.lineage_id ?? ""),
      status: String(parsed.status ?? ""),
      path: rel,
      officeCount: classifications.length,
      focusedReviews: classifications.filter((row) => row.human_review_required === true).length,
    });
  }
  return packs;
}

export function approvedContinuityPacks(root: string): ContinuityTierPack[] {
  return listContinuityTierPacks(root).filter((pack) => pack.status === "approved");
}

export function draftContinuityPacks(root: string): ContinuityTierPack[] {
  return listContinuityTierPacks(root).filter((pack) => pack.status !== "approved");
}

export function approvedCountryIds(root: string, lineageId: string): Set<string> {
  return new Set(
    approvedContinuityPacks(root)
      .filter((pack) => pack.lineageId === lineageId)
      .map((pack) => pack.countryId),
  );
}

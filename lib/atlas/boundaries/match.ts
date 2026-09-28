import { readFileSync } from "node:fs";
import { foldName, levenshtein } from "./fold";
import {
  CROSSWALK_SCHEMA,
  JURISDICTION_KEY_DEPENDENCY,
  type BoundaryName,
  type BoundarySource,
  type CrosswalkFile,
  type CrosswalkRow,
  type JurisdictionPlace,
  type LevelLabel,
  type UnmatchedPlace,
} from "./types";

const FUZZY_DISTANCE = 2;

export type MatchInput = {
  countryId: string;
  places: JurisdictionPlace[];
  features: BoundaryName[];
  sourceManifestId: string;
  boundarySource: BoundarySource;
  boundaryVersion: string;
};

function parentRelation(left: string | null, right: string | null): "equal" | "missing" | "differ" {
  const foldedLeft = left ? foldName(left) : "";
  const foldedRight = right ? foldName(right) : "";
  if (foldedLeft && foldedRight) return foldedLeft === foldedRight ? "equal" : "differ";
  if (!foldedLeft && !foldedRight) return "equal";
  return "missing";
}

function parentSentence(place: JurisdictionPlace, feature: BoundaryName): string {
  if (!place.parent_name && !feature.parent_name) {
    return "Parent name is null on the jurisdiction and on the boundary attribute row.";
  }
  return `Folded parent names are equal (${place.parent_name ?? "null"} / ${feature.parent_name ?? "null"}).`;
}

function keySentence(place: JurisdictionPlace): string {
  if (place.jurisdiction_key) {
    return `jurisdiction_key ${place.jurisdiction_key} was read from derived_jurisdiction and is still unapproved.`;
  }
  return "jurisdiction_key stays null until OV-01 derived_jurisdiction is present.";
}

function exactNote(place: JurisdictionPlace, feature: BoundaryName): string {
  return [
    "Draft proposal.",
    `Unique folded-name match of ${place.name} to ${feature.boundary_version} ${feature.name} (${feature.boundary_code}) within ${feature.country_code}.`,
    parentSentence(place, feature),
    keySentence(place),
    "Not a shape authorisation.",
  ].join(" ");
}

function fuzzyNote(place: JurisdictionPlace, feature: BoundaryName, distance: number): string {
  return [
    "Draft proposal.",
    `Folded-name distance ${distance} from ${place.name} to ${feature.boundary_version} ${feature.name} (${feature.boundary_code}) within ${feature.country_code}.`,
    "Unique candidate at that distance.",
    parentSentence(place, feature),
    keySentence(place),
    "Not a shape authorisation.",
  ].join(" ");
}

function placeGroupKey(place: JurisdictionPlace): string {
  const parent = place.parent_name ? foldName(place.parent_name) : "";
  return `${place.level}|${foldName(place.name)}|${parent}`;
}

/** Two jurisdictions with the same folded name, parent, and level stay unmatched. */
function uniquePlaces(places: JurisdictionPlace[], unmatchedPlaces: UnmatchedPlace[]): JurisdictionPlace[] {
  const groups = new Map<string, JurisdictionPlace[]>();
  for (const place of places) {
    const key = placeGroupKey(place);
    const list = groups.get(key) ?? [];
    list.push(place);
    groups.set(key, list);
  }
  const unique: JurisdictionPlace[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      unique.push(group[0]!);
      continue;
    }
    for (const place of group) {
      unmatchedPlaces.push(
        unmatched(place, "ambiguous jurisdiction: more than one row shares folded name, parent, and level"),
      );
    }
  }
  return unique;
}

function unmatched(place: JurisdictionPlace, reason: string): UnmatchedPlace {
  return {
    name: place.name,
    binding_geography_id: place.binding_geography_id,
    level: place.level,
    reason,
  };
}

/**
 * Propose crosswalk rows. Every proposal is draft_for_human_review.
 * A name match is not approval and does not authorise a shape.
 */
export function matchPlaces(input: MatchInput): CrosswalkFile {
  const features = input.features.filter((feature) => feature.boundary_source === input.boundarySource);
  const byName = new Map<string, BoundaryName[]>();
  for (const feature of features) {
    const key = foldName(feature.name);
    const list = byName.get(key) ?? [];
    list.push(feature);
    byName.set(key, list);
  }

  const usedCodes = new Set<string>();
  const rows: CrosswalkRow[] = [];
  const pendingFuzzy: JurisdictionPlace[] = [];
  const unmatchedPlaces: UnmatchedPlace[] = [];
  const places = uniquePlaces(input.places, unmatchedPlaces);

  for (const place of places) {
    const hits = (byName.get(foldName(place.name)) ?? []).filter(
      (feature) => parentRelation(place.parent_name, feature.parent_name) === "equal" && !usedCodes.has(feature.boundary_code),
    );
    if (hits.length === 1) {
      const feature = hits[0]!;
      usedCodes.add(feature.boundary_code);
      rows.push(rowFrom(place, feature, "name_parent_exact", 1, exactNote(place, feature)));
      continue;
    }
    if (hits.length > 1) {
      unmatchedPlaces.push(unmatched(place, "ambiguous folded name; more than one boundary feature"));
      continue;
    }
    const blocked = (byName.get(foldName(place.name)) ?? []).filter(
      (feature) => parentRelation(place.parent_name, feature.parent_name) === "differ",
    );
    if (blocked.length > 0) {
      unmatchedPlaces.push(unmatched(place, "folded name matches a boundary feature whose parent name differs"));
      continue;
    }
    const missingParent = (byName.get(foldName(place.name)) ?? []).filter(
      (feature) => parentRelation(place.parent_name, feature.parent_name) === "missing",
    );
    if (missingParent.length > 0) {
      unmatchedPlaces.push(unmatched(place, "parent name is supplied on only one side"));
      continue;
    }
    pendingFuzzy.push(place);
  }

  for (const place of pendingFuzzy) {
    const candidates: { feature: BoundaryName; distance: number }[] = [];
    for (const feature of features) {
      if (usedCodes.has(feature.boundary_code)) continue;
      if (parentRelation(place.parent_name, feature.parent_name) !== "equal") continue;
      const distance = levenshtein(foldName(place.name), foldName(feature.name));
      if (distance > 0 && distance <= FUZZY_DISTANCE) candidates.push({ feature, distance });
    }
    candidates.sort((left, right) => left.distance - right.distance || left.feature.boundary_code.localeCompare(right.feature.boundary_code));
    const best = candidates[0];
    const next = candidates[1];
    if (!best || (next && next.distance === best.distance)) {
      unmatchedPlaces.push(
        unmatched(place, best ? "ambiguous fuzzy name; more than one boundary feature at the same distance" : "no folded-name match within distance 2"),
      );
      continue;
    }
    usedCodes.add(best.feature.boundary_code);
    const confidence = best.distance === 1 ? 0.9 : 0.8;
    rows.push(rowFrom(place, best.feature, "name_parent_fuzzy", confidence, fuzzyNote(place, best.feature, best.distance)));
  }

  rows.sort((left, right) => left.boundary_code.localeCompare(right.boundary_code) || left.name.localeCompare(right.name));
  unmatchedPlaces.sort((left, right) => left.name.localeCompare(right.name));

  return {
    schema: CROSSWALK_SCHEMA,
    country_id: input.countryId,
    review_status: "draft_for_human_review",
    jurisdiction_key_dependency: JURISDICTION_KEY_DEPENDENCY,
    boundary_source: input.boundarySource,
    boundary_version: input.boundaryVersion,
    source_manifest_id: input.sourceManifestId,
    matched: rows.length,
    unmatched: unmatchedPlaces,
    rows,
  };
}

function rowFrom(
  place: JurisdictionPlace,
  feature: BoundaryName,
  method: CrosswalkRow["match_method"],
  confidence: number,
  note: string,
): CrosswalkRow {
  return {
    jurisdiction_key: place.jurisdiction_key,
    binding_geography_id: place.binding_geography_id,
    binding_territorial_unit_id: place.binding_territorial_unit_id,
    name: place.name,
    parent_name: place.parent_name,
    parent_key: place.parent_key,
    level: place.level,
    boundary_source: feature.boundary_source,
    boundary_code: feature.boundary_code,
    boundary_version: feature.boundary_version,
    match_method: method,
    confidence,
    review_status: "draft_for_human_review",
    reviewer_note: note,
  };
}

export function readLauAttributeCsv(csvText: string, version = "2023"): BoundaryName[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];
  const header = rows[0]!;
  const index = (name: string) => {
    const found = header.indexOf(name);
    if (found < 0) throw new Error(`LAU CSV is missing ${name}`);
    return found;
  };
  const cntr = index("CNTR_CODE");
  const id = index("LAU_ID");
  const name = index("LAU_NAME");
  const features: BoundaryName[] = [];
  for (const row of rows.slice(1)) {
    if (row.length === 0 || row.every((cell) => cell === "")) continue;
    features.push({
      boundary_source: "gisco_lau",
      boundary_code: requiredCell(row, id, "LAU_ID"),
      boundary_version: version,
      name: requiredCell(row, name, "LAU_NAME"),
      parent_name: null,
      country_code: requiredCell(row, cntr, "CNTR_CODE"),
    });
  }
  return features;
}

function requiredCell(row: string[], index: number, label: string): string {
  const value = row[index] ?? "";
  if (!value.trim()) throw new Error(`LAU CSV row is missing ${label}`);
  return value.trim();
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]!;
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (char !== "\r") cell += char;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export const ALBANIA_CURRENT_MUNICIPALITY_COUNT = 61;

export function albaniaMunicipalityPlaces(registerJsonl: string): JurisdictionPlace[] {
  const places: JurisdictionPlace[] = [];
  for (const line of registerJsonl.split("\n")) {
    if (!line.trim()) continue;
    const office = JSON.parse(line) as {
      country_id?: string;
      status?: string;
      office_type?: string;
      geography?: string;
      geography_id?: string | null;
      territorial_unit_id?: string | null;
    };
    if (office.country_id !== "albania" || office.status !== "current" || office.office_type !== "mayor") continue;
    if (!office.geography || !office.geography_id) {
      throw new Error(`current Albania mayor is missing a geography id: ${line.slice(0, 80)}`);
    }
    places.push({
      jurisdiction_key: null,
      binding_geography_id: office.geography_id,
      binding_territorial_unit_id: office.territorial_unit_id ?? null,
      name: office.geography,
      parent_name: null,
      parent_key: null,
      level: "municipality",
    });
  }
  if (places.length !== ALBANIA_CURRENT_MUNICIPALITY_COUNT) {
    throw new Error(`expected ${ALBANIA_CURRENT_MUNICIPALITY_COUNT} current Albania municipalities, found ${places.length}`);
  }
  return places;
}

export function loadAlbaniaMunicipalityPlaces(root: string): JurisdictionPlace[] {
  const path = `${root}/docs/phase1/albania/data/office-register.jsonl`;
  return albaniaMunicipalityPlaces(readFileSync(path, "utf8"));
}

export function levelForSource(source: BoundarySource): LevelLabel {
  if (source === "gisco_lau") return "municipality";
  if (source === "gisco_nuts" || source === "geoboundaries") return "region";
  return "country";
}

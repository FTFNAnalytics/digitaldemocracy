import { DatabaseSync } from "node:sqlite";
import { isCollectiveOfficeType, isSingleSeatOfficeType } from "../derive/seat";
import { tableExists } from "../sqlite";
import { foldName } from "./fold";
import type { JurisdictionPlace, LevelLabel } from "./types";
import { isLevelLabel } from "./types";

const REQUIRED_COLUMNS = ["jurisdiction_key", "country_id", "geography_id", "parent_key", "name", "level_label"] as const;

export function derivedJurisdictionColumnNames(db: DatabaseSync): string[] | null {
  if (!tableExists(db, "derived_jurisdiction")) return null;
  const columns = db.prepare("PRAGMA table_info(derived_jurisdiction)").all() as { name: string }[];
  return columns.map((column) => column.name);
}

type OfficeFact = {
  geography_id: string;
  office_type: string;
  office_status: string;
};

/**
 * Read municipality (or other) places from OV-01 derived_jurisdiction.
 * Throws if the table exists but does not have the columns this pipeline joins on.
 * Parent name is the parent row's name, not an inferred label.
 * A parent whose level is the country is the match scope (CNTR_CODE), not a subnational parent name.
 *
 * OV-01 stays one jurisdiction per geography, so mayor and council seats keep distinct keys.
 * Boundary matching needs one place per municipality. When the office table is present, a
 * geography with only historical offices is left out, and a folded name+parent+level group
 * that is exactly one current executive geography plus collective (council) siblings keeps
 * the executive geography. Any other duplicate group is returned whole so the matcher
 * still refuses an ambiguous name. Council shapes are the approved executive place, not a
 * second crosswalk row.
 */
export function loadPlacesFromDerived(db: DatabaseSync, countryId: string, level: LevelLabel): JurisdictionPlace[] {
  const columns = derivedJurisdictionColumnNames(db);
  if (!columns) throw new Error("derived_jurisdiction is not on this database");
  const names = new Set(columns);
  const missing = REQUIRED_COLUMNS.filter((column) => !names.has(column));
  if (missing.length > 0) {
    throw new Error(
      `OV-01 derived_jurisdiction schema does not match the boundary crosswalk: missing ${missing.join(", ")}`,
    );
  }
  const rows = db
    .prepare(
      `SELECT
         child.jurisdiction_key AS jurisdiction_key,
         child.geography_id AS geography_id,
         child.parent_key AS parent_key,
         child.name AS name,
         child.level_label AS level_label,
         parent.name AS parent_name,
         parent.level_label AS parent_level
       FROM derived_jurisdiction AS child
       LEFT JOIN derived_jurisdiction AS parent
         ON parent.jurisdiction_key = child.parent_key
       WHERE child.country_id = ? AND child.level_label = ?`,
    )
    .all(countryId, level) as {
    jurisdiction_key: string;
    geography_id: string | null;
    parent_key: string | null;
    name: string;
    level_label: string;
    parent_name: string | null;
    parent_level: string | null;
  }[];

  const places = rows.map((row) => {
    if (!isLevelLabel(row.level_label)) {
      throw new Error(`derived_jurisdiction level_label ${JSON.stringify(row.level_label)} is not a boundary level`);
    }
    if (typeof row.jurisdiction_key !== "string" || row.jurisdiction_key.trim().length === 0) {
      throw new Error("derived_jurisdiction row is missing jurisdiction_key");
    }
    if (typeof row.name !== "string" || row.name.trim().length === 0) {
      throw new Error(`derived_jurisdiction ${row.jurisdiction_key} is missing name`);
    }
    if (row.parent_key && !row.parent_name) {
      throw new Error(`derived_jurisdiction parent_key ${row.parent_key} has no parent row`);
    }
    return {
      jurisdiction_key: row.jurisdiction_key,
      binding_geography_id: row.geography_id,
      binding_territorial_unit_id: null,
      name: row.name,
      parent_name: row.parent_level === "country" ? null : row.parent_name,
      parent_key: row.parent_key,
      level: row.level_label,
    };
  });
  if (!tableExists(db, "office")) return places;
  return preferCurrentExecutivePlace(db, countryId, places);
}

function preferCurrentExecutivePlace(
  db: DatabaseSync,
  countryId: string,
  places: JurisdictionPlace[],
): JurisdictionPlace[] {
  const offices = db
    .prepare("SELECT geography_id, office_type, office_status FROM office WHERE country_id = ?")
    .all(countryId) as OfficeFact[];
  const byGeo = new Map<string, OfficeFact[]>();
  for (const office of offices) {
    const list = byGeo.get(office.geography_id) ?? [];
    list.push(office);
    byGeo.set(office.geography_id, list);
  }

  const current = places.filter((place) => isCurrentBoundaryPlace(place.binding_geography_id, byGeo));
  const groups = new Map<string, JurisdictionPlace[]>();
  for (const place of current) {
    const key = `${place.level}|${foldName(place.name)}|${place.parent_name ? foldName(place.parent_name) : ""}`;
    const list = groups.get(key) ?? [];
    list.push(place);
    groups.set(key, list);
  }

  const chosen: JurisdictionPlace[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      chosen.push(group[0]!);
      continue;
    }
    const executive = group.filter((place) => placeKind(place, byGeo) === "executive");
    const collective = group.filter((place) => placeKind(place, byGeo) === "collective");
    if (executive.length === 1 && collective.length === group.length - 1) {
      chosen.push(executive[0]!);
      continue;
    }
    for (const place of group) chosen.push(place);
  }
  chosen.sort((left, right) => (left.jurisdiction_key ?? "").localeCompare(right.jurisdiction_key ?? ""));
  return chosen;
}

function isCurrentBoundaryPlace(geographyId: string | null, byGeo: Map<string, OfficeFact[]>): boolean {
  if (!geographyId) return true;
  const offices = byGeo.get(geographyId);
  if (!offices || offices.length === 0) return true;
  return offices.some((office) => office.office_status === "current");
}

function placeKind(place: JurisdictionPlace, byGeo: Map<string, OfficeFact[]>): "executive" | "collective" | "other" {
  const offices = (place.binding_geography_id ? byGeo.get(place.binding_geography_id) : undefined) ?? [];
  const current = offices.filter((office) => office.office_status === "current");
  const executive = current.some((office) => isSingleSeatOfficeType(office.office_type));
  const collective = current.some((office) => isCollectiveOfficeType(office.office_type));
  if (executive && !collective) return "executive";
  if (collective && !executive) return "collective";
  return "other";
}

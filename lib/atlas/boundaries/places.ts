import { DatabaseSync } from "node:sqlite";
import { tableExists } from "../sqlite";
import type { JurisdictionPlace, LevelLabel } from "./types";
import { isLevelLabel } from "./types";

const REQUIRED_COLUMNS = ["jurisdiction_key", "country_id", "geography_id", "parent_key", "name", "level_label"] as const;

export function derivedJurisdictionColumnNames(db: DatabaseSync): string[] | null {
  if (!tableExists(db, "derived_jurisdiction")) return null;
  const columns = db.prepare("PRAGMA table_info(derived_jurisdiction)").all() as { name: string }[];
  return columns.map((column) => column.name);
}

/**
 * Read municipality (or other) places from OV-01 derived_jurisdiction.
 * Throws if the table exists but does not have the columns this pipeline joins on.
 * Parent name is the parent row's name, not an inferred label.
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
         parent.name AS parent_name
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
  }[];

  return rows.map((row) => {
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
      parent_name: row.parent_name,
      parent_key: row.parent_key,
      level: row.level_label,
    };
  });
}

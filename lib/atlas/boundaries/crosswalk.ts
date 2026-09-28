import { createHash } from "node:crypto";
import { sha256Hex } from "../identity";
import {
  CROSSWALK_SCHEMA,
  type CrosswalkFile,
  type CrosswalkRow,
  isBoundarySource,
  isLevelLabel,
  isMatchMethod,
  isReviewStatus,
} from "./types";

const ROW_KEYS: (keyof CrosswalkRow)[] = [
  "jurisdiction_key",
  "binding_geography_id",
  "binding_territorial_unit_id",
  "name",
  "parent_name",
  "parent_key",
  "level",
  "boundary_source",
  "boundary_code",
  "boundary_version",
  "match_method",
  "confidence",
  "review_status",
  "reviewer_note",
];

function asNullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string or null`);
  }
  return value;
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

export function assertCrosswalkRow(value: unknown, index: number): CrosswalkRow {
  if (!value || typeof value !== "object") throw new Error(`row ${index} is not an object`);
  const row = value as Record<string, unknown>;
  const level = row.level;
  const boundarySource = row.boundary_source;
  const matchMethod = row.match_method;
  const reviewStatus = row.review_status;
  if (!isLevelLabel(level)) throw new Error(`row ${index} has an invalid level`);
  if (!isBoundarySource(boundarySource)) throw new Error(`row ${index} has an invalid boundary_source`);
  if (!isMatchMethod(matchMethod)) throw new Error(`row ${index} has an invalid match_method`);
  if (!isReviewStatus(reviewStatus)) throw new Error(`row ${index} has an invalid review_status`);
  if (typeof row.confidence !== "number" || !Number.isFinite(row.confidence) || row.confidence < 0 || row.confidence > 1) {
    throw new Error(`row ${index} confidence must be between 0 and 1`);
  }
  return {
    jurisdiction_key: asNullableString(row.jurisdiction_key, `row ${index} jurisdiction_key`),
    binding_geography_id: asNullableString(row.binding_geography_id, `row ${index} binding_geography_id`),
    binding_territorial_unit_id: asNullableString(
      row.binding_territorial_unit_id,
      `row ${index} binding_territorial_unit_id`,
    ),
    name: asString(row.name, `row ${index} name`),
    parent_name: asNullableString(row.parent_name, `row ${index} parent_name`),
    parent_key: asNullableString(row.parent_key, `row ${index} parent_key`),
    level,
    boundary_source: boundarySource,
    boundary_code: asString(row.boundary_code, `row ${index} boundary_code`),
    boundary_version: asString(row.boundary_version, `row ${index} boundary_version`),
    match_method: matchMethod,
    confidence: row.confidence,
    review_status: reviewStatus,
    reviewer_note: typeof row.reviewer_note === "string" ? row.reviewer_note : "",
  };
}

export function parseCrosswalk(value: unknown): CrosswalkFile {
  if (!value || typeof value !== "object") throw new Error("crosswalk file is not an object");
  const file = value as Record<string, unknown>;
  if (file.schema !== CROSSWALK_SCHEMA) throw new Error(`crosswalk schema must be ${CROSSWALK_SCHEMA}`);
  if (!isReviewStatus(file.review_status)) throw new Error("crosswalk review_status is invalid");
  if (!isBoundarySource(file.boundary_source)) throw new Error("crosswalk boundary_source is invalid");
  if (!Array.isArray(file.rows)) throw new Error("crosswalk rows must be an array");
  if (!Array.isArray(file.unmatched)) throw new Error("crosswalk unmatched must be an array");
  const rows = file.rows.map((row, index) => assertCrosswalkRow(row, index));
  const codes = new Set<string>();
  const keys = new Set<string>();
  for (const row of rows) {
    const codeKey = `${row.boundary_source}:${row.boundary_code}`;
    if (codes.has(codeKey)) throw new Error(`duplicate boundary code ${codeKey}`);
    codes.add(codeKey);
    if (row.jurisdiction_key) {
      if (keys.has(row.jurisdiction_key)) throw new Error(`duplicate jurisdiction_key ${row.jurisdiction_key}`);
      keys.add(row.jurisdiction_key);
    }
  }
  return {
    schema: CROSSWALK_SCHEMA,
    country_id: asString(file.country_id, "country_id"),
    review_status: file.review_status,
    jurisdiction_key_dependency: asString(file.jurisdiction_key_dependency, "jurisdiction_key_dependency"),
    boundary_source: file.boundary_source,
    boundary_version: asString(file.boundary_version, "boundary_version"),
    source_manifest_id: asString(file.source_manifest_id, "source_manifest_id"),
    matched: rows.length,
    unmatched: file.unmatched as CrosswalkFile["unmatched"],
    rows,
  };
}

export function fileReviewStatus(rows: CrosswalkRow[]): CrosswalkFile["review_status"] {
  if (rows.length === 0) return "draft_for_human_review";
  if (rows.every((row) => row.review_status === "approved")) return "approved";
  if (rows.some((row) => row.review_status === "rejected") && rows.every((row) => row.review_status !== "draft_for_human_review")) {
    return "rejected";
  }
  return "draft_for_human_review";
}

export function serializeCrosswalk(file: CrosswalkFile): string {
  const rows = file.rows.map((row) => {
    const ordered: Record<string, unknown> = {};
    for (const key of ROW_KEYS) ordered[key] = row[key];
    return ordered;
  });
  const body = {
    schema: file.schema,
    country_id: file.country_id,
    review_status: file.review_status,
    jurisdiction_key_dependency: file.jurisdiction_key_dependency,
    boundary_source: file.boundary_source,
    boundary_version: file.boundary_version,
    source_manifest_id: file.source_manifest_id,
    matched: file.rows.length,
    unmatched: file.unmatched,
    rows,
  };
  return `${JSON.stringify(body, null, 2)}\n`;
}

/** SHA-256 of the canonical file. Null until every row is approved and keyed. */
export function approvedCrosswalkSha256(file: CrosswalkFile): string | null {
  if (file.review_status !== "approved") return null;
  if (file.rows.length === 0) return null;
  if (file.rows.some((row) => row.review_status !== "approved" || !row.jurisdiction_key)) return null;
  return sha256Hex(serializeCrosswalk(file));
}

export function sha256FileBytes(bytes: Buffer | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

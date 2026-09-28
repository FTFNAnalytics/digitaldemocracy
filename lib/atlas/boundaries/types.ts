export const BOUNDARY_SOURCES = [
  "gisco_nuts",
  "gisco_lau",
  "geoboundaries",
  "natural_earth",
  "national",
] as const;

export const MATCH_METHODS = [
  "code_supplied",
  "name_parent_exact",
  "name_parent_fuzzy",
  "manual",
] as const;

export const REVIEW_STATUSES = ["approved", "draft_for_human_review", "rejected"] as const;

export const LEVEL_LABELS = ["country", "region", "municipality", "ward", "area"] as const;

export const BOUNDARY_SCHEMA_VERSION = 5;
export const BOUNDARY_SCHEMA_DESCRIPTION = "Atlas boundary crosswalk";
export const CROSSWALK_SCHEMA = "atlas-boundary-crosswalk/1";

export type BoundarySource = (typeof BOUNDARY_SOURCES)[number];
export type MatchMethod = (typeof MATCH_METHODS)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type LevelLabel = (typeof LEVEL_LABELS)[number];

export type CrosswalkRow = {
  jurisdiction_key: string | null;
  binding_geography_id: string | null;
  binding_territorial_unit_id: string | null;
  name: string;
  parent_name: string | null;
  parent_key: string | null;
  level: LevelLabel;
  boundary_source: BoundarySource;
  boundary_code: string;
  boundary_version: string;
  match_method: MatchMethod;
  confidence: number;
  review_status: ReviewStatus;
  reviewer_note: string;
};

export type UnmatchedPlace = {
  name: string;
  binding_geography_id: string | null;
  level: LevelLabel;
  reason: string;
};

export type CrosswalkFile = {
  schema: typeof CROSSWALK_SCHEMA;
  country_id: string;
  review_status: ReviewStatus;
  jurisdiction_key_dependency: string;
  boundary_source: BoundarySource;
  boundary_version: string;
  source_manifest_id: string;
  matched: number;
  unmatched: UnmatchedPlace[];
  rows: CrosswalkRow[];
};

export type JurisdictionPlace = {
  jurisdiction_key: string | null;
  binding_geography_id: string | null;
  binding_territorial_unit_id: string | null;
  name: string;
  parent_name: string | null;
  parent_key: string | null;
  level: LevelLabel;
};

export type BoundaryName = {
  boundary_source: BoundarySource;
  boundary_code: string;
  boundary_version: string;
  name: string;
  parent_name: string | null;
  country_code: string;
};

export const JURISDICTION_KEY_DEPENDENCY =
  "OV-01 derived_jurisdiction.jurisdiction_key is not on this branch. Rows keep binding_geography_id and leave jurisdiction_key null until that table exists. No foreign key is declared.";

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && (REVIEW_STATUSES as readonly string[]).includes(value);
}

export function isBoundarySource(value: unknown): value is BoundarySource {
  return typeof value === "string" && (BOUNDARY_SOURCES as readonly string[]).includes(value);
}

export function isMatchMethod(value: unknown): value is MatchMethod {
  return typeof value === "string" && (MATCH_METHODS as readonly string[]).includes(value);
}

export function isLevelLabel(value: unknown): value is LevelLabel {
  return typeof value === "string" && (LEVEL_LABELS as readonly string[]).includes(value);
}

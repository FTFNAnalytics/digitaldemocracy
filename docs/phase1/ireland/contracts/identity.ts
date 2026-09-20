import { createHash, randomUUID } from "node:crypto";
import { digest, key, stable } from "../../scripts/import/normalize";
import { cellYear as bridgeCellYear } from "../observatory/adapters/tables";

/** Compact canonical JSON encoding C(value) from the existing bridge `stable`. */
export const canonical = stable;
export { digest, key };

export const OFFICE_NAMESPACE = "cdd-observatory-v1";
export const LINEAGE_ID = "country-package-albania";
export const SOURCE_NAMESPACE = "country-package-albania";
export const COUNTRY_ID = "albania";
export const ADAPTER_VERSION = "atlas-albania-field-map/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export const SCHEMA_VERSION = "atlas-master/1";
export const CANONICALIZATION = "atlas-c14n/1";
export const HASH_ALGORITHM = "sha256";
export const TIER_PATH = "schemas/atlas/tiers/albania.json";
export const PACKAGE_PREFIX = "data/countries/albania";
export const REGISTER_RELATIVE = "data/countries/albania/tables/office-register.json";
export const REGISTER_SHA256 = "7d5a3735e83f95ee82deb76c60c6d391fa5faadfd3f660fe71ca8ca0ca05ad62";
export const ATTEMPT_LOG_SCHEMA_PATH = "0001_atlas_attempt_log.sql";
export const MASTER_SCHEMA_PATH = "0002_atlas_master.sql";
export const ATTEMPT_LOG_SHA256 = "e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1";
export const MASTER_SCHEMA_SHA256 = "1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da";
export const SCRIPT_VERSION = "atlas-import/1.0.0";
export const DEFAULT_OPERATOR = "atlas-import-service";

export const EXPECTED_COUNTS = {
  current_offices: 122,
  historical_offices: 0,
  geographies: 122,
  selected_histories: 366,
  result_rows: 3843,
  control_observations_retained: 45,
  national_polls_retained: 1,
  source_catalogue_rows: 182,
  inline_only_sources: 3,
  sources: 185,
  briefings_retained: 122,
  municipal_offices: 122,
  regional_offices: 0,
  proceedings: 0,
  party_mappings: 0,
  package_files_retained: 163,
} as const;

export function sha256Hex(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function newAttemptId(): string {
  return `attempt-${randomUUID().toLowerCase()}`;
}

export function utcNow(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, "Z");
}

/** Identity-strict cellText: other types reject rather than silently stringify. */
export function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  throw new Error(`Identity cellText rejects type ${typeof value}`);
}

export function cellYear(value: unknown): number | null {
  return bridgeCellYear(value);
}

export function historyKey(officeId: string, year: unknown, ballotDate: unknown): string {
  const date = cellText(ballotDate);
  const y = cellYear(year);
  return `${officeId}::${y ?? (cellText(year) || "undated")}::${date}`;
}

export function eventIdFor(hk: string): string {
  return key("event", ["albania", hk]);
}

export function geographyIdFor(jurisdiction: string, office: string): string {
  return key("geo", ["albania", jurisdiction, office]);
}

export function catalogueSourceId(sourceId: string): string {
  return `albania--${sourceId}`;
}

export function urlSourceId(url: string): string {
  return `albania--${key("url", url)}`;
}

export function recordKey(entityKind: string, components: unknown[]): string {
  return `rec-${sha256Hex(canonical([entityKind, ...components]))}`;
}

export function dateId(ownerType: string, ownerId: string, slot: string): string {
  return `date-${sha256Hex(canonical([OFFICE_NAMESPACE, ownerType, ownerId, slot]))}`;
}

export function evidenceId(
  rec: string,
  sourceTuple: [string, string, string],
  occurrenceIdentity: unknown[],
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, sourceTuple, occurrenceIdentity, claimKind]))}`;
}

export function unresolvedId(rec: string, occurrenceIdentity: unknown[], originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, occurrenceIdentity, originalToken]))}`;
}

export type HashInputDescriptor = {
  input_path: string;
  input_kind: "package" | "artifact" | "tier_classification" | "override";
  sha256: string;
  byte_count: number;
};

export type SchemaInputDescriptor = {
  input_path: string;
  sha256: string;
};

export type HashInputsObject = {
  canonicalization: typeof CANONICALIZATION;
  hash_algorithm: typeof HASH_ALGORITHM;
  lineage_id: typeof LINEAGE_ID;
  inputs: HashInputDescriptor[];
  overrides: HashInputDescriptor[];
  adapter_version: typeof ADAPTER_VERSION;
  method_version: string;
  schema_version: typeof SCHEMA_VERSION;
  schema_inputs: SchemaInputDescriptor[];
};

export function sortByInputPath<T extends { input_path: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.input_path < b.input_path ? -1 : a.input_path > b.input_path ? 1 : 0));
}

export function buildHashInputs(args: {
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
  methodVersion?: string;
  schemaInputs?: SchemaInputDescriptor[];
}): HashInputsObject {
  const schemaInputs = sortByInputPath(
    args.schemaInputs ?? [
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ],
  );
  return {
    canonicalization: CANONICALIZATION,
    hash_algorithm: HASH_ALGORITHM,
    lineage_id: LINEAGE_ID,
    inputs: sortByInputPath(args.inputs),
    overrides: sortByInputPath(args.overrides ?? []),
    adapter_version: ADAPTER_VERSION,
    method_version: args.methodVersion ?? METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: schemaInputs,
  };
}

export function fingerprintSha256(hashInputs: HashInputsObject): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function isFixtureId(value: string | null | undefined): boolean {
  if (!value) return false;
  const upper = value.toUpperCase();
  return upper.startsWith("FIX-") || upper.startsWith("FXT-");
}

export type Locator = {
  input_path: string;
  sha256: string | null;
  json_pointer: string | null;
  sheet: string | null;
  source_row: number | null;
  column: string | null;
  html_anchor_index: number | null;
  retained_input_path?: string;
  archive_entry?: string;
};

export function locator(partial: Partial<Locator> & Pick<Locator, "input_path">): Locator {
  return {
    input_path: partial.input_path,
    sha256: partial.sha256 ?? null,
    json_pointer: partial.json_pointer ?? null,
    sheet: partial.sheet ?? null,
    source_row: partial.source_row ?? null,
    column: partial.column ?? null,
    html_anchor_index: partial.html_anchor_index ?? null,
    ...(partial.retained_input_path ? { retained_input_path: partial.retained_input_path } : {}),
    ...(partial.archive_entry ? { archive_entry: partial.archive_entry } : {}),
  };
}

export function occurrenceIdentity(loc: Locator): unknown[] {
  return [loc.input_path, loc.sheet, loc.source_row, loc.column, loc.json_pointer, loc.html_anchor_index];
}

export type RawEnvelope = {
  origin: Locator;
  row: unknown;
  columns: unknown[] | null;
  values: unknown[] | null;
  supplemental: unknown;
};

export function rawEnvelope(args: {
  origin: Locator;
  row: unknown;
  columns?: unknown[] | null;
  values?: unknown[] | null;
  supplemental?: unknown;
}): string {
  const envelope: RawEnvelope = {
    origin: args.origin,
    row: args.row,
    columns: args.columns ?? null,
    values: args.values ?? null,
    supplemental: args.supplemental ?? null,
  };
  return JSON.stringify(envelope);
}

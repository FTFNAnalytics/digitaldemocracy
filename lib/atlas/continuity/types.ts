export type SqlRow = Record<string, unknown>;

export type ContinuityProjection = {
  lineageId: string;
  lineage: SqlRow;
  release: SqlRow;
  publicationRelease: SqlRow;
  retainedInputs: SqlRow[];
  countries: SqlRow[];
  geographies: SqlRow[];
  offices: SqlRow[];
  tiers: SqlRow[];
  dates: SqlRow[];
  events: SqlRow[];
  proceedings: SqlRow[];
  sources: SqlRow[];
  results: SqlRow[];
  locators: SqlRow[];
  evidence: SqlRow[];
  unresolved: SqlRow[];
  crosswalks: SqlRow[];
  validatedCounts: Record<string, number>;
  skippedDraftCountries: string[];
};

export type TrackedFile = {
  absPath: string;
  input_path: string;
  input_kind: "package" | "artifact" | "tier_classification" | "override";
  sha256: string;
  byte_count: number;
  text: string | null;
};

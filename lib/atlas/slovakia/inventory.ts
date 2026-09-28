import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
} from "../identity";
import { ATLAS_ATTEMPT_LOG_FILENAME, ATLAS_MASTER_FILENAME, ATLAS_MIGRATIONS_DIR } from "../migrations";
import {
  ADAPTER_VERSION,
  DOCS_PREFIX,
  EP_ID,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_PROCEEDINGS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCES,
  HUMAN_REVIEW_RELATIVE,
  INPUT_INVENTORY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  PINNED_INPUTS,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  VALIDATION_RELATIVE,
  buildHashInputs,
  canonical,
  classifySlovakiaOffice,
  fingerprintSha256,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type SlovakiaOfficeClass,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type SlovakiaClassification = {
  office_id: string;
  tier: string;
  rationale: string;
  human_review_required: boolean;
  tier_uncertain: boolean;
  review_categories: string[];
  evidence: unknown[];
};

export type SlovakiaTierFile = {
  schema_version: string;
  lineage_id: string;
  country_slug: string;
  country_id: string;
  status: string;
  counts_by_proposed_tier: Record<string, number>;
  schema_compatibility: Record<string, string | null>;
  approval: {
    Justin_accepted?: boolean;
    production_accepted?: boolean;
    decision?: string;
  };
  classifications: SlovakiaClassification[];
};

export type SlovakiaOffice = {
  row: SlovakiaClassification;
  index: number;
  cls: SlovakiaOfficeClass;
};

export type SlovakiaInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: SlovakiaTierFile;
  offices: SlovakiaOffice[];
  metadata: {
    research_coverage_complete: boolean;
    applied_changes: number;
    justin_approved: boolean;
  };
  intendedInventory: Record<string, unknown>;
};

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function gitTracked(root: string, spec: string): string[] {
  const output = execFileSync("git", ["-C", root, "ls-files", "-z", "--", spec], { encoding: "buffer" });
  return output
    .toString("utf8")
    .split("\0")
    .filter((rel) => Boolean(rel))
    .sort();
}

export class SlovakiaPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

const CLASSIFICATION_KEYS = new Set([
  "office_id",
  "tier",
  "rationale",
  "human_review_required",
  "tier_uncertain",
  "review_categories",
  "evidence",
]);

export function scanSlovakiaInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): SlovakiaInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new SlovakiaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new SlovakiaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new SlovakiaPreflightError(
        "omitted_bytes_present",
        `Omitted Slovakia pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new SlovakiaPreflightError(
      "omitted_bytes_present",
      "data/research/slovakia is git-tracked. The importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, DOCS_PREFIX);
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      const missing = packagePaths.filter((rel) => !tracked.includes(rel));
      const extra = tracked.filter((rel) => !packagePaths.includes(rel));
      throw new SlovakiaPreflightError(
        "package_inventory",
        "Slovakia git-tracked pack does not match the pinned inputs.",
        { missing, extra },
      );
    }
  }

  const packageFilesMeta: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }> = [];
  const tracked: TrackedInput[] = [];
  for (const rel of packagePaths) {
    const abs = rel === TIER_PATH && options.tierPath ? tierAbs : path.join(root, rel);
    try {
      const bytes = readFileSync(abs);
      const item: TrackedInput = {
        input_path: rel,
        input_kind: inputKindFor(rel),
        sha256: sha256Hex(bytes),
        byte_count: bytes.length,
        absPath: abs,
      };
      tracked.push(item);
      packageFilesMeta.push({ input_path: rel, sha256: item.sha256, byte_count: item.byte_count });
    } catch (error) {
      packageFilesMeta.push({
        input_path: rel,
        sha256: null,
        byte_count: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const tierItem = tracked.find((item) => item.input_path === TIER_PATH);
  const intendedInventory: Record<string, unknown> = {
    lineage_id: LINEAGE_ID,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: [
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ],
    git_commit: gitCommit,
    package_files: packageFilesMeta,
    tier: {
      input_path: TIER_PATH,
      sha256: tierItem?.sha256 ?? null,
      byte_count: tierItem?.byte_count ?? null,
    },
    overrides: [],
    omitted_research_dir: OMITTED_RESEARCH_DIR,
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
    events_file_not_projected: "data/research/slovakia/events.json",
    results_file_not_projected: "data/research/slovakia/results.json",
    sources_file_not_projected: "data/research/slovakia/sources.json",
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new SlovakiaPreflightError("missing_tier", `Slovakia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new SlovakiaPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new SlovakiaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Slovakia inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new SlovakiaPreflightError(
      "tier_hash_mismatch",
      `Slovakia tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  let tiers: SlovakiaTierFile;
  try {
    tiers = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as SlovakiaTierFile;
  } catch (error) {
    throw new SlovakiaPreflightError(
      "tier_unreadable",
      `Slovakia tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (
    tiers.status !== "approved" ||
    tiers.approval?.Justin_accepted !== true ||
    tiers.approval?.production_accepted !== true ||
    tiers.approval?.decision !== "accept_with_holds"
  ) {
    throw new SlovakiaPreflightError(
      "tier_receipt",
      "Slovakia tier file must stay approved, production_accepted, and accept_with_holds.",
      intendedInventory,
    );
  }
  if (tiers.lineage_id !== LINEAGE_ID || tiers.country_id !== "slovakia" || tiers.country_slug !== "slovakia") {
    throw new SlovakiaPreflightError("tier_receipt", "Slovakia tier file lineage or country drifted.", intendedInventory);
  }
  if (tiers.schema_version !== "atlas-tier-classification/1") {
    throw new SlovakiaPreflightError("tier_receipt", "Slovakia tier schema_version drifted.", intendedInventory);
  }
  const histogram = tiers.counts_by_proposed_tier ?? {};
  if (
    histogram.municipal !== EXPECTED_COUNTS.draft_tier_municipal ||
    histogram.regional !== EXPECTED_COUNTS.draft_tier_regional ||
    histogram.national !== EXPECTED_COUNTS.draft_tier_national ||
    histogram.other !== EXPECTED_COUNTS.draft_tier_other ||
    histogram.unknown !== 0
  ) {
    throw new SlovakiaPreflightError("numeric_tier", "Slovakia counts_by_proposed_tier drifted.", intendedInventory);
  }
  const compat = tiers.schema_compatibility ?? {};
  if (compat.national !== "national_context" || compat.regional !== "regional" || compat.municipal !== "municipal" || compat.other !== "other" || compat.unknown !== null) {
    throw new SlovakiaPreflightError("numeric_tier", "Slovakia schema_compatibility drifted.", intendedInventory);
  }
  if (!Array.isArray(tiers.classifications) || tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new SlovakiaPreflightError(
      "office_count",
      `Slovakia tier rows ${tiers.classifications?.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: SlovakiaOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const typeHistogram = new Map<string, number>();
  const pairs = new Map<string, { tier: string; sides: Set<string> }>();
  let focused = 0;
  for (const [index, raw] of tiers.classifications.entries()) {
    if (!raw || typeof raw !== "object") {
      throw new SlovakiaPreflightError("office_register", `Classification ${index} is not an object.`, intendedInventory);
    }
    for (const field of Object.keys(raw)) {
      if (!CLASSIFICATION_KEYS.has(field)) {
        throw new SlovakiaPreflightError(
          "office_register",
          `Refusing undocumented Slovakia classification field ${field} on ${String(raw.office_id)}.`,
          intendedInventory,
        );
      }
    }
    const officeId = String(raw.office_id ?? "");
    if (!officeId || seen.has(officeId)) {
      throw new SlovakiaPreflightError("duplicate_office", `Duplicate or blank Slovakia office ${officeId}.`, intendedInventory);
    }
    seen.add(officeId);
    if (typeof raw.rationale !== "string" || !raw.rationale.trim()) {
      throw new SlovakiaPreflightError("office_register", `Office ${officeId} rationale is empty.`, intendedInventory);
    }
    if (!Array.isArray(raw.evidence) || raw.evidence.length === 0) {
      throw new SlovakiaPreflightError("office_register", `Office ${officeId} evidence is empty. Rows are not projected as sources.`, intendedInventory);
    }
    if (!Array.isArray(raw.review_categories)) {
      throw new SlovakiaPreflightError("office_register", `Office ${officeId} review_categories drifted.`, intendedInventory);
    }
    const cls = classifySlovakiaOffice(officeId, String(raw.tier));
    const categories = raw.review_categories.map((item) => String(item));
    const focusedRow = raw.human_review_required === true;
    if (focusedRow) focused += 1;
    if (raw.tier === "other") {
      const expectedCategory = officeId === EP_ID ? "ep_delegation_policy" : "city_part_tier_policy";
      if (!focusedRow || raw.tier_uncertain !== true || categories.join(",") !== expectedCategory) {
        throw new SlovakiaPreflightError(
          "named_holds",
          `Office ${officeId} must stay a focused other-tier hold (${expectedCategory}).`,
          intendedInventory,
        );
      }
    } else if (focusedRow || raw.tier_uncertain !== false || categories.length !== 0) {
      throw new SlovakiaPreflightError(
        "named_holds",
        `Office ${officeId} must stay unfocused. Focused flags stay the 79 city-part and EP rows.`,
        intendedInventory,
      );
    }
    draftHistogram.set(raw.tier, (draftHistogram.get(raw.tier) ?? 0) + 1);
    typeHistogram.set(cls.officeType, (typeHistogram.get(cls.officeType) ?? 0) + 1);
    if (cls.localCode) {
      const pair = pairs.get(cls.geographyId) ?? { tier: raw.tier, sides: new Set<string>() };
      if (pair.tier !== raw.tier) {
        throw new SlovakiaPreflightError(
          "numeric_tier",
          `Council and mayor for ${cls.geographyId} must share one draft tier.`,
          intendedInventory,
        );
      }
      pair.sides.add(officeId.endsWith("-C") ? "C" : "M");
      pairs.set(cls.geographyId, pair);
    }
    if (cls.vucCode) {
      const pair = pairs.get(cls.geographyId) ?? { tier: raw.tier, sides: new Set<string>() };
      if (pair.tier !== "regional") {
        throw new SlovakiaPreflightError("numeric_tier", `VUC ${cls.geographyId} must stay regional.`, intendedInventory);
      }
      pair.sides.add(officeId.endsWith("-C") ? "C" : "P");
      pairs.set(cls.geographyId, pair);
    }
    offices.push({
      row: {
        office_id: officeId,
        tier: raw.tier,
        rationale: raw.rationale,
        human_review_required: raw.human_review_required === true,
        tier_uncertain: raw.tier_uncertain === true,
        review_categories: categories,
        evidence: raw.evidence,
      },
      index,
      cls,
    });
  }
  if (
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal ||
    draftHistogram.get("regional") !== EXPECTED_COUNTS.draft_tier_regional ||
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("other") !== EXPECTED_COUNTS.draft_tier_other
  ) {
    throw new SlovakiaPreflightError("numeric_tier", "Slovakia draft tier histogram drifted.", intendedInventory);
  }
  if (
    typeHistogram.get("municipal_council") !== EXPECTED_COUNTS.municipal_councils ||
    typeHistogram.get("direct_mayor") !== EXPECTED_COUNTS.municipal_mayors ||
    typeHistogram.get("city_part_council") !== EXPECTED_COUNTS.city_part_councils ||
    typeHistogram.get("city_part_mayor") !== EXPECTED_COUNTS.city_part_mayors ||
    typeHistogram.get("vuc_assembly") !== EXPECTED_COUNTS.vuc_assemblies ||
    typeHistogram.get("direct_vuc_chair") !== EXPECTED_COUNTS.vuc_chairs ||
    typeHistogram.get("national_parliament") !== 1 ||
    typeHistogram.get("president") !== 1 ||
    typeHistogram.get("european_parliament_delegation") !== 1 ||
    focused !== EXPECTED_COUNTS.focused_review_offices
  ) {
    throw new SlovakiaPreflightError("office_count", "Slovakia office-type histogram drifted.", intendedInventory);
  }
  const obecPairs = [...pairs.entries()].filter(([id]) => id.startsWith("SK-OBEC-"));
  const vucPairs = [...pairs.entries()].filter(([id]) => id.startsWith("SK-VUC-"));
  if (obecPairs.length !== EXPECTED_COUNTS.local_jurisdictions || obecPairs.some(([, pair]) => pair.sides.size !== 2)) {
    throw new SlovakiaPreflightError(
      "office_count",
      "Each local code must keep a council and a direct mayor, and no extra local body.",
      intendedInventory,
    );
  }
  if (vucPairs.length !== 8 || vucPairs.some(([, pair]) => pair.sides.size !== 2 || !pair.sides.has("C") || !pair.sides.has("P"))) {
    throw new SlovakiaPreflightError("office_count", "Each VUC must keep an assembly and a direct chair.", intendedInventory);
  }

  const reviewItem = tracked.find((item) => item.input_path === HUMAN_REVIEW_RELATIVE);
  const inventoryItem = tracked.find((item) => item.input_path === INPUT_INVENTORY_RELATIVE);
  const validationItem = tracked.find((item) => item.input_path === VALIDATION_RELATIVE);
  if (!reviewItem || !inventoryItem || !validationItem) {
    throw new SlovakiaPreflightError(
      "package_inventory",
      "Slovakia human-review, input inventory, or validation receipt is missing.",
      intendedInventory,
    );
  }
  const humanReview = JSON.parse(readFileSync(reviewItem.absPath, "utf8")) as {
    status?: string;
    focused_review_count?: number;
    applied_changes?: number;
    rows?: Array<{ office_id?: string; proposed_changes?: unknown[] }>;
  };
  const reviewIds = (humanReview.rows ?? []).map((row) => String(row.office_id ?? "")).sort();
  const focusedIds = offices
    .filter((office) => office.row.human_review_required)
    .map((office) => office.row.office_id)
    .sort();
  if (
    humanReview.status !== "draft_for_human_review" ||
    humanReview.applied_changes !== 0 ||
    humanReview.focused_review_count !== EXPECTED_COUNTS.focused_review_offices ||
    reviewIds.length !== focusedIds.length ||
    reviewIds.some((id, index) => id !== focusedIds[index]) ||
    (humanReview.rows ?? []).some((row) => Array.isArray(row.proposed_changes) && row.proposed_changes.length !== 0)
  ) {
    throw new SlovakiaPreflightError(
      "named_holds",
      "Slovakia human-review.json must stay the 79 focused rows with applied_changes 0.",
      intendedInventory,
    );
  }

  const inputInventory = JSON.parse(readFileSync(inventoryItem.absPath, "utf8")) as {
    lineage_id?: string;
    counts?: Record<string, unknown>;
  };
  const counts = inputInventory.counts ?? {};
  if (inputInventory.lineage_id !== LINEAGE_ID) {
    throw new SlovakiaPreflightError("office_count", "Slovakia input inventory lineage drifted.", intendedInventory);
  }
  if (
    counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    counts.historical_offices_recovered !== 0 ||
    counts.historical_office_universe_complete !== false ||
    counts.offices !== EXPECTED_COUNTS.offices ||
    counts.municipal_councils !== EXPECTED_COUNTS.municipal_councils ||
    counts.municipal_direct_mayors !== EXPECTED_COUNTS.municipal_mayors ||
    counts.city_part_councils !== EXPECTED_COUNTS.city_part_councils ||
    counts.city_part_direct_mayors !== EXPECTED_COUNTS.city_part_mayors ||
    counts.VUC_assemblies !== EXPECTED_COUNTS.vuc_assemblies ||
    counts.VUC_direct_chairs !== EXPECTED_COUNTS.vuc_chairs ||
    counts.national_parliament !== 1 ||
    counts.direct_president !== 1 ||
    counts.EP_delegation !== 1 ||
    counts.direct_executive_offices !== EXPECTED_COUNTS.direct_executive_offices ||
    counts.councils_assemblies_chambers_delegation !== EXPECTED_COUNTS.councils_assemblies_chambers_delegation ||
    counts.local_jurisdictions !== EXPECTED_COUNTS.local_jurisdictions ||
    counts.missing_local_cycle_bindings !== 44
  ) {
    throw new SlovakiaPreflightError("office_count", "Slovakia input inventory office counts drifted.", intendedInventory);
  }
  if (
    counts.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    counts.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    counts.proceedings !== FULL_PACK_DOCUMENTED_PROCEEDINGS ||
    counts.sources !== FULL_PACK_DOCUMENTED_SOURCES
  ) {
    throw new SlovakiaPreflightError(
      "counts_file",
      "Slovakia input inventory event/result figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }
  const validation = JSON.parse(readFileSync(validationItem.absPath, "utf8")) as { status?: string };
  if (validation.status !== "PASS") {
    throw new SlovakiaPreflightError("coverage", "Slovakia validation.json must stay the pre-acceptance PASS receipt.", intendedInventory);
  }

  const metadata = {
    research_coverage_complete: false,
    applied_changes: 0,
    justin_approved: false,
  };
  if (NAMED_HOLDS.length !== EXPECTED_COUNTS.named_open_holds) {
    throw new SlovakiaPreflightError("named_holds", "Slovakia named holds drifted.", intendedInventory);
  }

  const hashInputs = buildHashInputs({
    inputs: tracked.map(({ input_path, input_kind, sha256, byte_count }) => ({
      input_path,
      input_kind,
      sha256,
      byte_count,
    })),
  });
  const fingerprint = fingerprintSha256(hashInputs);
  const releaseId = releaseIdFor(fingerprint);

  return {
    root,
    tierPath: TIER_PATH,
    gitCommit,
    tracked,
    byPath: new Map(tracked.map((item) => [item.input_path, item])),
    fingerprint,
    releaseId,
    hashInputsJson: canonical(hashInputs),
    hashInputs,
    tiers,
    offices,
    metadata,
    intendedInventory,
  };
}

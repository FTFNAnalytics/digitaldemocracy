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
  FULL_PACK_DAMAGED_LABELS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_HISTORICAL_EVENTS,
  FULL_PACK_DOCUMENTED_PROCEEDINGS,
  FULL_PACK_DOCUMENTED_PROSPECTIVE_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCES,
  FULL_PACK_FINGERPRINT,
  FULL_PACK_LV2018_EVENTS,
  INPUT_INVENTORY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  PINNED_INPUTS,
  PREDECESSOR_DRAFT_TIER_SHA256,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  VALIDATION_RELATIVE,
  buildHashInputs,
  canonical,
  classifySloveniaOffice,
  fingerprintSha256,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type SloveniaOfficeClass,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type SloveniaClassification = {
  office_id: string;
  tier: string;
  rationale: string;
  human_review_required: boolean;
  tier_uncertain: boolean;
  evidence: unknown[];
};

export type SloveniaTierFile = {
  schema_version: string;
  lineage_id: string;
  country_slug: string;
  country_id: string;
  status: string;
  counts_by_proposed_tier: Record<string, number>;
  approval: {
    Justin_accepted?: boolean;
    production_accepted?: boolean;
    decision?: string;
  };
  classifications: SloveniaClassification[];
};

export type SloveniaOffice = {
  row: SloveniaClassification;
  index: number;
  cls: SloveniaOfficeClass;
};

export type SloveniaInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: SloveniaTierFile;
  offices: SloveniaOffice[];
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

export class SloveniaPreflightError extends Error {
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
  "evidence",
]);

export function scanSloveniaInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): SloveniaInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new SloveniaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new SloveniaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new SloveniaPreflightError(
        "omitted_bytes_present",
        `Omitted Slovenia pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new SloveniaPreflightError(
      "omitted_bytes_present",
      "data/research/slovenia is git-tracked. The importer does not adopt omitted research bytes.",
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
      throw new SloveniaPreflightError(
        "package_inventory",
        "Slovenia git-tracked pack does not match the pinned inputs.",
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
    events_file_not_projected: "data/research/slovenia/events.json",
    results_file_not_projected: "data/research/slovenia/results.json",
    sources_file_not_projected: "data/research/slovenia/sources.json",
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new SloveniaPreflightError("missing_tier", `Slovenia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new SloveniaPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new SloveniaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Slovenia inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new SloveniaPreflightError(
      "tier_hash_mismatch",
      `Slovenia tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  let tiers: SloveniaTierFile;
  try {
    tiers = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as SloveniaTierFile;
  } catch (error) {
    throw new SloveniaPreflightError(
      "tier_unreadable",
      `Slovenia tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (
    tiers.status !== "approved" ||
    tiers.approval?.Justin_accepted !== true ||
    tiers.approval?.production_accepted !== true ||
    tiers.approval?.decision !== "accept_with_holds"
  ) {
    throw new SloveniaPreflightError(
      "tier_receipt",
      "Slovenia tier file must stay approved, production_accepted, and accept_with_holds.",
      intendedInventory,
    );
  }
  if (tiers.lineage_id !== LINEAGE_ID || tiers.country_id !== "slovenia" || tiers.country_slug !== "slovenia") {
    throw new SloveniaPreflightError("tier_receipt", "Slovenia tier file lineage or country drifted.", intendedInventory);
  }
  if (tiers.schema_version !== "atlas-tier-classification/1") {
    throw new SloveniaPreflightError("tier_receipt", "Slovenia tier schema_version drifted.", intendedInventory);
  }
  const histogram = tiers.counts_by_proposed_tier ?? {};
  if (
    histogram.municipal !== EXPECTED_COUNTS.draft_tier_municipal ||
    histogram.regional !== EXPECTED_COUNTS.draft_tier_regional ||
    histogram.national !== EXPECTED_COUNTS.draft_tier_national ||
    histogram.other !== EXPECTED_COUNTS.draft_tier_other ||
    histogram.unknown !== 0
  ) {
    throw new SloveniaPreflightError("numeric_tier", "Slovenia counts_by_proposed_tier drifted.", intendedInventory);
  }
  if (!Array.isArray(tiers.classifications) || tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new SloveniaPreflightError(
      "office_count",
      `Slovenia tier rows ${tiers.classifications?.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: SloveniaOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const typeHistogram = new Map<string, number>();
  const pairs = new Map<string, { tier: string; sides: Set<string> }>();
  let focused = 0;
  for (const [index, raw] of tiers.classifications.entries()) {
    if (!raw || typeof raw !== "object") {
      throw new SloveniaPreflightError("office_register", `Classification ${index} is not an object.`, intendedInventory);
    }
    for (const field of Object.keys(raw)) {
      if (!CLASSIFICATION_KEYS.has(field)) {
        throw new SloveniaPreflightError(
          "office_register",
          `Refusing undocumented Slovenia classification field ${field} on ${String(raw.office_id)}.`,
          intendedInventory,
        );
      }
    }
    const officeId = String(raw.office_id ?? "");
    if (!officeId || seen.has(officeId)) {
      throw new SloveniaPreflightError("duplicate_office", `Duplicate or blank Slovenia office ${officeId}.`, intendedInventory);
    }
    seen.add(officeId);
    if (typeof raw.rationale !== "string" || !raw.rationale.trim()) {
      throw new SloveniaPreflightError("office_register", `Office ${officeId} rationale is empty.`, intendedInventory);
    }
    if (!Array.isArray(raw.evidence) || raw.evidence.length === 0) {
      throw new SloveniaPreflightError("office_register", `Office ${officeId} evidence is empty. Rows are not projected as sources.`, intendedInventory);
    }
    const cls = classifySloveniaOffice(officeId, String(raw.tier));
    const focusedRow = raw.human_review_required === true;
    if (focusedRow) focused += 1;
    if (officeId === EP_ID) {
      if (raw.tier !== "other" || !focusedRow || raw.tier_uncertain !== true) {
        throw new SloveniaPreflightError(
          "named_holds",
          "SI-EP must stay a focused other-tier hold.",
          intendedInventory,
        );
      }
    } else if (focusedRow || raw.tier_uncertain !== false || raw.tier === "other") {
      throw new SloveniaPreflightError(
        "named_holds",
        `Office ${officeId} must stay unfocused. The focused flag stays on SI-EP.`,
        intendedInventory,
      );
    }
    draftHistogram.set(raw.tier, (draftHistogram.get(raw.tier) ?? 0) + 1);
    typeHistogram.set(cls.officeType, (typeHistogram.get(cls.officeType) ?? 0) + 1);
    if (cls.localCode) {
      const pair = pairs.get(cls.geographyId) ?? { tier: raw.tier, sides: new Set<string>() };
      if (pair.tier !== raw.tier) {
        throw new SloveniaPreflightError(
          "numeric_tier",
          `Council and mayor for ${cls.geographyId} must share one draft tier.`,
          intendedInventory,
        );
      }
      pair.sides.add(officeId.endsWith("-C") ? "C" : "M");
      pairs.set(cls.geographyId, pair);
    }
    offices.push({
      row: {
        office_id: officeId,
        tier: raw.tier,
        rationale: raw.rationale,
        human_review_required: raw.human_review_required === true,
        tier_uncertain: raw.tier_uncertain === true,
        evidence: raw.evidence,
      },
      index,
      cls,
    });
  }
  if (
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal ||
    (draftHistogram.get("regional") ?? 0) !== EXPECTED_COUNTS.draft_tier_regional ||
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("other") !== EXPECTED_COUNTS.draft_tier_other
  ) {
    throw new SloveniaPreflightError("numeric_tier", "Slovenia draft tier histogram drifted.", intendedInventory);
  }
  if (
    typeHistogram.get("municipal_council") !== EXPECTED_COUNTS.municipal_councils ||
    typeHistogram.get("direct_mayor") !== EXPECTED_COUNTS.municipal_mayors ||
    typeHistogram.get("national_assembly") !== 1 ||
    typeHistogram.get("national_council") !== 1 ||
    typeHistogram.get("president") !== 1 ||
    typeHistogram.get("european_parliament_delegation") !== 1 ||
    focused !== EXPECTED_COUNTS.focused_review_offices
  ) {
    throw new SloveniaPreflightError("office_count", "Slovenia office-type histogram drifted.", intendedInventory);
  }
  const municipalPairs = [...pairs.entries()].filter(([id]) => id.startsWith("SI-OB-"));
  if (
    municipalPairs.length !== EXPECTED_COUNTS.local_jurisdictions ||
    municipalPairs.some(([, pair]) => pair.sides.size !== 2 || !pair.sides.has("C") || !pair.sides.has("M"))
  ) {
    throw new SloveniaPreflightError(
      "office_count",
      "Each municipality code must keep a council and a direct mayor, and no extra local body.",
      intendedInventory,
    );
  }

  const inventoryItem = tracked.find((item) => item.input_path === INPUT_INVENTORY_RELATIVE);
  const validationItem = tracked.find((item) => item.input_path === VALIDATION_RELATIVE);
  if (!inventoryItem || !validationItem) {
    throw new SloveniaPreflightError(
      "package_inventory",
      "Slovenia input inventory or validation receipt is missing.",
      intendedInventory,
    );
  }

  const inputInventory = JSON.parse(readFileSync(inventoryItem.absPath, "utf8")) as {
    lineage_id?: string;
    fingerprint_sha256?: string;
    approval?: { Justin_accepted?: boolean };
    tier_file?: { sha256?: string };
    counts?: Record<string, unknown>;
  };
  const counts = inputInventory.counts ?? {};
  const tierHistogram = (counts.tier_histogram ?? {}) as Record<string, unknown>;
  const eventsByCycle = (counts.events_by_cycle ?? {}) as Record<string, unknown>;
  if (inputInventory.lineage_id !== LINEAGE_ID) {
    throw new SloveniaPreflightError("office_count", "Slovenia input inventory lineage drifted.", intendedInventory);
  }
  if (inputInventory.fingerprint_sha256 !== FULL_PACK_FINGERPRINT) {
    throw new SloveniaPreflightError(
      "counts_file",
      "Slovenia input inventory full-pack fingerprint drifted. Publication still uses the slim-land fingerprint.",
      intendedInventory,
    );
  }
  if (inputInventory.approval?.Justin_accepted !== false) {
    throw new SloveniaPreflightError(
      "coverage",
      "Slovenia input inventory must stay the pre-acceptance receipt.",
      intendedInventory,
    );
  }
  if (inputInventory.tier_file?.sha256 !== PREDECESSOR_DRAFT_TIER_SHA256) {
    throw new SloveniaPreflightError(
      "tier_hash_mismatch",
      "Slovenia input inventory must keep the predecessor draft tier hash. The approved tier file is a separate retained input.",
      intendedInventory,
    );
  }
  if (
    counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    counts.historical_only_offices_recovered !== 0 ||
    counts.municipalities !== EXPECTED_COUNTS.local_jurisdictions ||
    counts.municipal_councils !== EXPECTED_COUNTS.municipal_councils ||
    counts.direct_mayors !== EXPECTED_COUNTS.municipal_mayors ||
    counts.direct_president !== 1 ||
    counts.direct_executives !== EXPECTED_COUNTS.direct_executive_offices ||
    counts.councils_chambers_delegation !== EXPECTED_COUNTS.councils_chambers_delegation ||
    counts.national_assembly !== 1 ||
    counts.indirect_national_council !== 1 ||
    counts.ep_delegation !== 1 ||
    counts.geographies !== EXPECTED_COUNTS.geographies ||
    tierHistogram.municipal !== EXPECTED_COUNTS.draft_tier_municipal ||
    tierHistogram.national !== EXPECTED_COUNTS.draft_tier_national ||
    tierHistogram.other !== EXPECTED_COUNTS.draft_tier_other ||
    tierHistogram.regional != null ||
    eventsByCycle.LV2018 !== FULL_PACK_LV2018_EVENTS ||
    counts.result_labels_with_source_replacement_character !== FULL_PACK_DAMAGED_LABELS
  ) {
    throw new SloveniaPreflightError("office_count", "Slovenia input inventory office counts drifted.", intendedInventory);
  }
  if (
    counts.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    counts.historical_events !== FULL_PACK_DOCUMENTED_HISTORICAL_EVENTS ||
    counts.prospective_events !== FULL_PACK_DOCUMENTED_PROSPECTIVE_EVENTS ||
    counts.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    counts.proceedings !== FULL_PACK_DOCUMENTED_PROCEEDINGS ||
    counts.sources !== FULL_PACK_DOCUMENTED_SOURCES
  ) {
    throw new SloveniaPreflightError(
      "counts_file",
      "Slovenia input inventory event/result figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }
  const validation = JSON.parse(readFileSync(validationItem.absPath, "utf8")) as { status?: string };
  if (validation.status !== "PASS") {
    throw new SloveniaPreflightError("coverage", "Slovenia validation.json must stay the pre-acceptance PASS receipt.", intendedInventory);
  }

  const metadata = {
    research_coverage_complete: false,
    applied_changes: 0,
    justin_approved: false,
  };
  if (NAMED_HOLDS.length !== EXPECTED_COUNTS.named_open_holds) {
    throw new SloveniaPreflightError("named_holds", "Slovenia named holds drifted.", intendedInventory);
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

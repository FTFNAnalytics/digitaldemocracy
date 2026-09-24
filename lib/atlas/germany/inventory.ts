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
  EXPECTED_COUNTS,
  LINEAGE_ID,
  METHOD_VERSION,
  METADATA_RELATIVE,
  NAMED_HOLDS,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  PINNED_INPUTS,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  buildHashInputs,
  canonical,
  classifyGermanyOffice,
  fingerprintSha256,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type GermanyTierOffice = {
  office_id: string;
  tier: number;
  review_status: string;
  rationale: string;
  justin_approved: boolean;
};

export type GermanyTierFile = {
  country: string;
  country_code: string;
  prompt: string;
  Justin_accepted: boolean;
  review_status: string;
  draft_for_human_review: boolean;
  office_count: number;
  offices: GermanyTierOffice[];
};

export type GermanyInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: GermanyTierFile;
  metadata: {
    research_coverage_complete: boolean;
    applied_changes: number;
    justin_approvals: Record<string, boolean>;
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

export class GermanyPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

export function scanGermanyInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): GermanyInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new GermanyPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new GermanyPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new GermanyPreflightError(
        "omitted_bytes_present",
        `Omitted Germany pack path is present: ${rel}. The slim importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new GermanyPreflightError(
      "omitted_bytes_present",
      "data/research/germany is git-tracked. The slim importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, "docs/phase1/germany");
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier];
    for (const rel of packagePaths) {
      if (!tracked.includes(rel)) {
        throw new GermanyPreflightError("package_inventory", `Germany pack file is not git-tracked: ${rel}.`, {});
      }
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
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new GermanyPreflightError("missing_tier", `Germany tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new GermanyPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new GermanyPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Germany inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new GermanyPreflightError("tier_hash_mismatch", `Germany tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }

  let tiers: GermanyTierFile;
  try {
    tiers = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as GermanyTierFile;
  } catch (error) {
    throw new GermanyPreflightError(
      "tier_unreadable",
      `Germany tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tiers.Justin_accepted !== false || tiers.draft_for_human_review !== true || tiers.review_status !== "needs_review") {
    throw new GermanyPreflightError(
      "tier_receipt",
      "Germany tier file must stay Justin_accepted false, draft_for_human_review true, and review_status needs_review.",
      intendedInventory,
    );
  }
  if (tiers.country !== "germany" || tiers.country_code !== "DE" || tiers.prompt !== "AS") {
    throw new GermanyPreflightError("tier_receipt", "Germany tier file country/prompt drifted.", intendedInventory);
  }
  if (!Array.isArray(tiers.offices) || tiers.offices.length !== EXPECTED_COUNTS.offices || tiers.office_count !== EXPECTED_COUNTS.offices) {
    throw new GermanyPreflightError(
      "office_count",
      `Germany tier office_count ${tiers.office_count} / rows ${tiers.offices?.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const seen = new Set<string>();
  const draftHistogram = new Map<number, number>();
  for (const office of tiers.offices) {
    if (seen.has(office.office_id)) {
      throw new GermanyPreflightError("duplicate_office", `Duplicate Germany office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    if (office.justin_approved !== false || office.review_status !== "draft_unapproved") {
      throw new GermanyPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and review_status draft_unapproved.`,
        intendedInventory,
      );
    }
    if (office.tier !== 1 && office.tier !== 2 && office.tier !== 3 && office.tier !== 4) {
      throw new GermanyPreflightError("numeric_tier", `Office ${office.office_id} numeric tier ${office.tier} is not 1–4.`, intendedInventory);
    }
    const classified = classifyGermanyOffice(office.office_id);
    if (classified.expectedDraftTier !== office.tier) {
      throw new GermanyPreflightError(
        "numeric_tier",
        `Office ${office.office_id} numeric tier ${office.tier} does not match its supplied id class ${classified.expectedDraftTier}. Refusing to remap.`,
        intendedInventory,
      );
    }
    draftHistogram.set(office.tier, (draftHistogram.get(office.tier) ?? 0) + 1);
  }
  if (
    draftHistogram.get(1) !== EXPECTED_COUNTS.draft_tier_1 ||
    draftHistogram.get(2) !== EXPECTED_COUNTS.draft_tier_2 ||
    draftHistogram.get(3) !== EXPECTED_COUNTS.draft_tier_3 ||
    draftHistogram.get(4) !== EXPECTED_COUNTS.draft_tier_4
  ) {
    throw new GermanyPreflightError(
      "numeric_tier",
      `Germany numeric tiers ${draftHistogram.get(1)}/${draftHistogram.get(2)}/${draftHistogram.get(3)}/${draftHistogram.get(4)} are not 3/20/552/22055.`,
      intendedInventory,
    );
  }

  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  if (!metadataItem) {
    throw new GermanyPreflightError("package_inventory", "Germany metadata.json is missing.", intendedInventory);
  }
  const metadata = JSON.parse(readFileSync(metadataItem.absPath, "utf8")) as GermanyInventory["metadata"];
  if (metadata.research_coverage_complete !== false || metadata.applied_changes !== 0) {
    throw new GermanyPreflightError(
      "coverage",
      "Germany metadata must stay research_coverage_complete false and applied_changes 0.",
      intendedInventory,
    );
  }
  for (const value of Object.values(metadata.justin_approvals ?? {})) {
    if (value !== false) {
      throw new GermanyPreflightError("coverage", "Germany metadata justin_approvals must stay false.", intendedInventory);
    }
  }
  if (NAMED_HOLDS.length !== EXPECTED_COUNTS.named_holds) {
    throw new GermanyPreflightError("named_holds", "Germany named holds must stay DE-G01 through DE-G23.", intendedInventory);
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
    metadata,
    intendedInventory,
  };
}

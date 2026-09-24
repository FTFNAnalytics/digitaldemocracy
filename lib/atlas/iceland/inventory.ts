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
  ALTHINGI_ID,
  COUNTS_RELATIVE,
  CROSSWALK_RELATIVE,
  CURRENT_NAMESPACE,
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCES,
  GAP_IDS,
  GAP_STATUS,
  GEOGRAPHIES_RELATIVE,
  HISTORICAL_NAMESPACE,
  HUMAN_REVIEW_RELATIVE,
  LINEAGE_ID,
  MERGER_UPSTREAM_NAMESPACE,
  METADATA_RELATIVE,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  PINNED_INPUTS,
  PRESIDENT_ID,
  REGISTER_COUNTRY_ID,
  RESEARCH_GAPS_RELATIVE,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  assertAllowedOfficeIdentity,
  assertKnownRegisterKeys,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  gapIsOpen,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type IcelandDraftTier,
  type IcelandRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type IcelandNextDate = {
  label: string;
  precision: string;
  certainty: string;
  alert_window?: string;
};

export type IcelandTierOffice = {
  office_id: string;
  tier: IcelandDraftTier;
  review_status: string;
  justin_approved: boolean;
  rationale: string;
  classification_kind: string;
};

export type IcelandRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  geography_id: string;
  name: string;
  jurisdiction_name: string;
  office_type: string;
  status: IcelandRegisterStatus;
  popular_selection: string;
  direct_executive: boolean;
  tier_draft: IcelandDraftTier;
  source_ids: string[];
  record_state: string;
  registry_qualified: boolean;
  next_date: IcelandNextDate | null;
  state_note: string;
  election_mode_2026?: string;
  successor_office_id?: string;
  observed_cycles?: number[];
  register_index: number;
};

export type IcelandGeography = {
  geography_id: string;
  name: string;
  type: string;
  status: "current" | "historical_only";
  source_ids: string[];
  aliases?: string[];
  geography_index: number;
};

export type IcelandCrosswalk = {
  entity_kind: string;
  upstream_namespace: string;
  upstream_id: string;
  record_key: string;
  source_ids: string[];
  reason: string;
  effective_year: number;
  crosswalk_index: number;
};

export type IcelandGap = {
  gap_id: string;
  topic: string;
  status: string;
  detail: string;
};

export type IcelandInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: IcelandTierOffice[];
  offices: IcelandRegisterOffice[];
  geographies: IcelandGeography[];
  crosswalks: IcelandCrosswalk[];
  gaps: IcelandGap[];
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

export class IcelandPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

const REGISTER_STATUSES = new Set<string>(["current", "historical_only"]);
const DRAFT_TIERS = new Set<string>(["national", "municipal"]);
const REGISTER_ELECTION_MODES = new Set(["restricted_proportional_list", "unrestricted", "unopposed_no_poll"]);

export function scanIcelandInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): IcelandInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new IcelandPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new IcelandPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new IcelandPreflightError(
        "omitted_bytes_present",
        `Omitted Iceland pack path is present: ${rel}. The slim importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new IcelandPreflightError(
      "omitted_bytes_present",
      "data/research/iceland is git-tracked. The slim importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, "docs/phase1/iceland");
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      throw new IcelandPreflightError(
        "package_inventory",
        "Iceland git-tracked pack does not match the pinned slim inputs.",
        { tracked, pinned: packagePaths },
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
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new IcelandPreflightError("missing_tier", `Iceland tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new IcelandPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new IcelandPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Iceland inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new IcelandPreflightError(
      "tier_hash_mismatch",
      `Iceland tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  let tiers: IcelandTierOffice[];
  try {
    const parsed = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("tier file is not an array");
    }
    tiers = parsed as IcelandTierOffice[];
  } catch (error) {
    throw new IcelandPreflightError(
      "tier_unreadable",
      `Iceland tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tiers.length !== EXPECTED_COUNTS.offices) {
    throw new IcelandPreflightError(
      "office_count",
      `Iceland tier rows ${tiers.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const geoItem = tracked.find((item) => item.input_path === GEOGRAPHIES_RELATIVE);
  const crosswalkItem = tracked.find((item) => item.input_path === CROSSWALK_RELATIVE);
  const reviewItem = tracked.find((item) => item.input_path === HUMAN_REVIEW_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  if (!registerItem || !draftItem || !countsItem || !gapsItem || !geoItem || !crosswalkItem || !reviewItem || !metadataItem) {
    throw new IcelandPreflightError(
      "package_inventory",
      "Iceland register, tiers, counts, gaps, geographies, crosswalk, review, or metadata is missing.",
      intendedInventory,
    );
  }
  if (requireGit && draftItem.sha256 !== tierItem.sha256) {
    throw new IcelandPreflightError(
      "numeric_tier",
      "Iceland draft-tiers.json bytes do not match schemas/atlas/tiers/iceland.json. Refusing to remap.",
      intendedInventory,
    );
  }

  const registerRows = JSON.parse(readFileSync(registerItem.absPath, "utf8")) as Array<Omit<IcelandRegisterOffice, "register_index">>;
  if (!Array.isArray(registerRows)) {
    throw new IcelandPreflightError("office_register", "Iceland office register is not an array.", intendedInventory);
  }
  const offices: IcelandRegisterOffice[] = registerRows.map((row, index) => {
    assertKnownRegisterKeys(String(row.office_id), row);
    return { ...row, register_index: index };
  });
  if (offices.length !== EXPECTED_COUNTS.offices) {
    throw new IcelandPreflightError(
      "office_count",
      `Iceland office register has ${offices.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const draftRows = JSON.parse(readFileSync(draftItem.absPath, "utf8")) as IcelandTierOffice[];
  if (!Array.isArray(draftRows) || draftRows.length !== EXPECTED_COUNTS.offices) {
    throw new IcelandPreflightError("office_count", "Iceland draft-tiers.json row count drifted.", intendedInventory);
  }
  const draftById = new Map(draftRows.map((row) => [row.office_id, row]));
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));
  const registerById = new Map(offices.map((row) => [row.office_id, row]));

  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const modeHistogram = new Map<string, number>();
  for (const office of offices) {
    if (seen.has(office.office_id)) {
      throw new IcelandPreflightError("duplicate_office", `Duplicate Iceland office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    const draft = draftById.get(office.office_id);
    const tier = tierById.get(office.office_id);
    if (!draft || !tier) {
      throw new IcelandPreflightError(
        "office_count",
        `Office ${office.office_id} is missing from the draft tiers or schema tier file.`,
        intendedInventory,
      );
    }
    if (
      draft.tier !== tier.tier ||
      draft.review_status !== tier.review_status ||
      draft.justin_approved !== tier.justin_approved ||
      draft.rationale !== tier.rationale ||
      draft.classification_kind !== tier.classification_kind
    ) {
      throw new IcelandPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft-tiers.json does not match the schema tier file. Refusing to remap.`,
        intendedInventory,
      );
    }
    if (tier.justin_approved !== false || tier.review_status !== "draft_for_human_review") {
      throw new IcelandPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and review_status draft_for_human_review.`,
        intendedInventory,
      );
    }
    if (tier.classification_kind !== "draft_for_human_review") {
      throw new IcelandPreflightError(
        "review_status",
        `Office ${office.office_id} classification_kind must stay draft_for_human_review.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier) || office.tier_draft !== tier.tier) {
      throw new IcelandPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft tier ${String(tier.tier)} does not match the register.`,
        intendedInventory,
      );
    }
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (!REGISTER_STATUSES.has(office.status)) {
      throw new IcelandPreflightError(
        "office_status",
        `Office ${office.office_id} register status ${String(office.status)} is not current or historical_only.`,
        intendedInventory,
      );
    }
    if (office.country_id !== REGISTER_COUNTRY_ID || office.registry_qualified !== false || office.record_state !== "draft_research") {
      throw new IcelandPreflightError(
        "office_register",
        `Office ${office.office_id} must stay country IS, registry_qualified false, and record_state draft_research.`,
        intendedInventory,
      );
    }
    if (!office.geography_id || !office.state_note?.trim() || !Array.isArray(office.source_ids) || office.source_ids.length === 0) {
      throw new IcelandPreflightError("office_register", `Office ${office.office_id} is missing geography, state note, or source ids.`, intendedInventory);
    }
    if (office.status === "current") {
      if (office.id_namespace !== CURRENT_NAMESPACE || office.successor_office_id || office.observed_cycles) {
        throw new IcelandPreflightError(
          "office_register",
          `Current office ${office.office_id} must stay in ${CURRENT_NAMESPACE} with no successor edge on the row.`,
          intendedInventory,
        );
      }
    } else if (office.id_namespace !== HISTORICAL_NAMESPACE || !office.successor_office_id || !office.observed_cycles?.length) {
      throw new IcelandPreflightError(
        "office_register",
        `Historical office ${office.office_id} must stay in ${HISTORICAL_NAMESPACE} with its supplied successor and cycles.`,
        intendedInventory,
      );
    }
    if (office.direct_executive) {
      if (office.office_id !== PRESIDENT_ID || office.office_type !== "direct_executive" || office.status !== "current") {
        throw new IcelandPreflightError("office_register", `Refusing a direct executive that is not the current President on ${office.office_id}.`, intendedInventory);
      }
    } else if (office.office_type === "direct_executive") {
      throw new IcelandPreflightError("office_register", `Office ${office.office_id} is typed direct_executive without the direct_executive flag.`, intendedInventory);
    }
    if (office.office_id === ALTHINGI_ID) {
      if (office.office_type !== "legislature" || office.status !== "current" || office.tier_draft !== "national" || office.next_date != null) {
        throw new IcelandPreflightError("office_register", "Alþingi must stay a current national legislature with no next date.", intendedInventory);
      }
    }
    if (office.office_id === PRESIDENT_ID) {
      if (office.tier_draft !== "national" || office.next_date?.precision !== "month_range" || office.next_date.certainty !== "constitutional_window") {
        throw new IcelandPreflightError(
          "office_register",
          "The President must stay a national office whose supplied next date is month_range/constitutional_window. That label is not coerced.",
          intendedInventory,
        );
      }
    }
    if (office.office_type === "municipal_council") {
      if (office.tier_draft !== "municipal" || office.direct_executive) {
        throw new IcelandPreflightError("office_register", `Municipal council ${office.office_id} must stay municipal and not a direct executive.`, intendedInventory);
      }
      if (office.status === "current") {
        if (!office.election_mode_2026 || !REGISTER_ELECTION_MODES.has(office.election_mode_2026)) {
          throw new IcelandPreflightError(
            "office_register",
            `Current municipal council ${office.office_id} election_mode_2026 ${String(office.election_mode_2026)} is not a supplied register mode.`,
            intendedInventory,
          );
        }
        if (office.next_date?.precision !== "day" || office.next_date.certainty !== "official_scheduled" || !office.next_date.label) {
          throw new IcelandPreflightError(
            "office_register",
            `Current municipal council ${office.office_id} next date must stay the supplied day/official_scheduled label. It is not coerced.`,
            intendedInventory,
          );
        }
        modeHistogram.set(office.election_mode_2026, (modeHistogram.get(office.election_mode_2026) ?? 0) + 1);
      } else if (office.election_mode_2026 || office.next_date != null) {
        throw new IcelandPreflightError(
          "office_register",
          `Historical municipal council ${office.office_id} must not gain a 2026 mode or a next date.`,
          intendedInventory,
        );
      }
    } else if (office.election_mode_2026) {
      throw new IcelandPreflightError("office_register", `Office ${office.office_id} must not carry a municipal 2026 election mode.`, intendedInventory);
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
  }
  if (seen.size !== registerById.size || seen.size !== draftById.size || seen.size !== tierById.size) {
    throw new IcelandPreflightError("office_count", "Iceland tier, draft, and register id sets differ.", intendedInventory);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal
  ) {
    throw new IcelandPreflightError(
      "numeric_tier",
      `Iceland draft tiers ${draftHistogram.get("national")}/${draftHistogram.get("municipal")} are not 2/85.`,
      intendedInventory,
    );
  }
  if (
    modeHistogram.get("restricted_proportional_list") !== EXPECTED_COUNTS.election_mode_restricted_proportional_list ||
    modeHistogram.get("unrestricted") !== EXPECTED_COUNTS.election_mode_unrestricted ||
    modeHistogram.get("unopposed_no_poll") !== EXPECTED_COUNTS.election_mode_unopposed_no_poll
  ) {
    throw new IcelandPreflightError(
      "office_register",
      "Iceland election_mode_2026 histogram drifted. Register labels are not renamed to the counts-file mode names.",
      intendedInventory,
    );
  }

  const geographyRows = JSON.parse(readFileSync(geoItem.absPath, "utf8")) as Array<Omit<IcelandGeography, "geography_index">>;
  if (!Array.isArray(geographyRows)) {
    throw new IcelandPreflightError("geography", "Iceland geographies.json is not an array.", intendedInventory);
  }
  const geographies: IcelandGeography[] = geographyRows.map((row, index) => ({ ...row, geography_index: index }));
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new IcelandPreflightError("geography", `Iceland geographies ${geographies.length} is not ${EXPECTED_COUNTS.geographies}.`, intendedInventory);
  }
  const geoIds = new Set<string>();
  let currentGeos = 0;
  let historicalGeos = 0;
  let municipalityGeos = 0;
  for (const geography of geographies) {
    if (geoIds.has(geography.geography_id)) {
      throw new IcelandPreflightError("geography", `Duplicate Iceland geography ${geography.geography_id}.`, intendedInventory);
    }
    geoIds.add(geography.geography_id);
    if (geography.status !== "current" && geography.status !== "historical_only") {
      throw new IcelandPreflightError("geography", `Geography ${geography.geography_id} status ${geography.status} is not supplied.`, intendedInventory);
    }
    if (geography.type !== "country" && geography.type !== "municipality") {
      throw new IcelandPreflightError("geography", `Geography ${geography.geography_id} type ${geography.type} is not supplied.`, intendedInventory);
    }
    if (!geography.name?.trim()) {
      throw new IcelandPreflightError("geography", `Geography ${geography.geography_id} is missing its name.`, intendedInventory);
    }
    if (geography.status === "current") currentGeos += 1;
    else historicalGeos += 1;
    if (geography.type === "municipality") municipalityGeos += 1;
  }
  if (
    currentGeos !== EXPECTED_COUNTS.current_geographies ||
    historicalGeos !== EXPECTED_COUNTS.historical_geographies ||
    municipalityGeos !== EXPECTED_COUNTS.municipality_geographies ||
    !geoIds.has("IS")
  ) {
    throw new IcelandPreflightError("geography", "Iceland geography histogram drifted.", intendedInventory);
  }
  for (const office of offices) {
    if (!geoIds.has(office.geography_id)) {
      throw new IcelandPreflightError("geography", `Office ${office.office_id} geography ${office.geography_id} is not in geographies.json.`, intendedInventory);
    }
  }

  const crosswalkRows = JSON.parse(readFileSync(crosswalkItem.absPath, "utf8")) as Array<Omit<IcelandCrosswalk, "crosswalk_index">>;
  if (!Array.isArray(crosswalkRows) || crosswalkRows.length !== EXPECTED_COUNTS.explicit_predecessor_edges) {
    throw new IcelandPreflightError("crosswalk", "Iceland identity-crosswalk.json must stay 24 source-supported edges.", intendedInventory);
  }
  const crosswalks: IcelandCrosswalk[] = crosswalkRows.map((row, index) => ({ ...row, crosswalk_index: index }));
  const edgeByPredecessor = new Map<string, IcelandCrosswalk>();
  for (const edge of crosswalks) {
    if (edge.entity_kind !== "office" || edge.upstream_namespace !== MERGER_UPSTREAM_NAMESPACE) {
      throw new IcelandPreflightError("crosswalk", `Crosswalk ${edge.upstream_id} namespace or entity kind drifted.`, intendedInventory);
    }
    if (!edge.reason?.trim() || !Array.isArray(edge.source_ids) || edge.source_ids.length === 0 || !Number.isInteger(edge.effective_year)) {
      throw new IcelandPreflightError("crosswalk", `Crosswalk ${edge.upstream_id} is missing its supplied reason, source, or year.`, intendedInventory);
    }
    if (edge.upstream_id === edge.record_key) {
      throw new IcelandPreflightError("crosswalk", `Refusing a self-successor edge ${edge.upstream_id}.`, intendedInventory);
    }
    if (edgeByPredecessor.has(edge.upstream_id)) {
      throw new IcelandPreflightError("crosswalk", `Duplicate predecessor ${edge.upstream_id}.`, intendedInventory);
    }
    const predecessor = registerById.get(edge.upstream_id);
    const successor = registerById.get(edge.record_key);
    if (!predecessor || predecessor.status !== "historical_only" || predecessor.successor_office_id !== edge.record_key) {
      throw new IcelandPreflightError("crosswalk", `Predecessor ${edge.upstream_id} is not the documented historical office.`, intendedInventory);
    }
    if (!successor) {
      throw new IcelandPreflightError("crosswalk", `Successor ${edge.record_key} is not an office in the register.`, intendedInventory);
    }
    edgeByPredecessor.set(edge.upstream_id, edge);
  }
  for (const office of offices) {
    if (office.status !== "historical_only") continue;
    const edge = edgeByPredecessor.get(office.office_id);
    if (!edge || edge.record_key !== office.successor_office_id) {
      throw new IcelandPreflightError("crosswalk", `Historical office ${office.office_id} successor does not match the crosswalk.`, intendedInventory);
    }
  }

  const countsFile = JSON.parse(readFileSync(countsItem.absPath, "utf8")) as {
    current_offices: number;
    historical_only_offices: number;
    total_offices: number;
    current_municipal_councils: number;
    historical_municipal_councils: number;
    current_direct_executive_offices: number;
    direct_municipal_executive_offices: number;
    current_council_or_chamber_offices: number;
    european_parliament_offices: number;
    events: number;
    results: number;
    sources: number;
    applied_changes: number;
    research_coverage_complete?: boolean;
    draft_tier_histogram: Record<string, number>;
    municipal_cycle_membership: Record<string, number>;
    municipal_mode_histograms: Record<string, Record<string, number>>;
  };
  const mode2026 = countsFile.municipal_mode_histograms?.["2026"];
  if (
    countsFile.total_offices !== EXPECTED_COUNTS.offices ||
    countsFile.current_offices !== EXPECTED_COUNTS.current_offices ||
    countsFile.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    countsFile.current_municipal_councils !== EXPECTED_COUNTS.current_municipal_councils ||
    countsFile.historical_municipal_councils !== EXPECTED_COUNTS.historical_municipal_councils ||
    countsFile.current_direct_executive_offices !== EXPECTED_COUNTS.direct_executive_offices ||
    countsFile.direct_municipal_executive_offices !== 0 ||
    countsFile.current_council_or_chamber_offices !== EXPECTED_COUNTS.current_council_or_chamber_offices ||
    countsFile.european_parliament_offices !== 0 ||
    countsFile.applied_changes !== 0 ||
    countsFile.draft_tier_histogram?.national !== EXPECTED_COUNTS.draft_tier_national ||
    countsFile.draft_tier_histogram?.municipal !== EXPECTED_COUNTS.draft_tier_municipal ||
    countsFile.municipal_cycle_membership?.["2014"] !== 74 ||
    countsFile.municipal_cycle_membership?.["2018"] !== 72 ||
    countsFile.municipal_cycle_membership?.["2022"] !== 64 ||
    countsFile.municipal_cycle_membership?.["2026"] !== 61 ||
    mode2026?.restricted_proportional_list !== 50 ||
    mode2026?.unrestricted_write_in !== 7 ||
    mode2026?.one_list_self_elected_no_poll !== 4
  ) {
    throw new IcelandPreflightError("office_count", "Iceland counts.json does not match the accepted pack counts.", intendedInventory);
  }
  if (countsFile.research_coverage_complete !== undefined && countsFile.research_coverage_complete !== false) {
    throw new IcelandPreflightError("coverage", "Iceland research_coverage_complete must stay false.", intendedInventory);
  }
  if (
    countsFile.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    countsFile.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    countsFile.sources !== FULL_PACK_DOCUMENTED_SOURCES
  ) {
    throw new IcelandPreflightError(
      "counts_file",
      "Iceland counts.json full-pack event/result/source figures drifted. Slim publish still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const gaps = JSON.parse(readFileSync(gapsItem.absPath, "utf8")) as IcelandGap[];
  if (!Array.isArray(gaps) || gaps.length !== GAP_IDS.length || gaps.map((gap) => gap.gap_id).join(",") !== GAP_IDS.join(",")) {
    throw new IcelandPreflightError("named_holds", "Iceland research gaps must stay IS-G01 through IS-G06.", intendedInventory);
  }
  for (const gap of gaps) {
    const expectedStatus = GAP_STATUS[gap.gap_id as (typeof GAP_IDS)[number]];
    if (gap.status !== expectedStatus || !gap.detail?.trim() || !gap.topic?.trim()) {
      throw new IcelandPreflightError("named_holds", `Hold ${gap.gap_id} status drifted from ${expectedStatus}.`, intendedInventory);
    }
    if (gapIsOpen(gap.gap_id) && !gap.status.startsWith("open")) {
      throw new IcelandPreflightError("named_holds", `Open hold ${gap.gap_id} must stay open.`, intendedInventory);
    }
    if (!gapIsOpen(gap.gap_id) && gap.status.startsWith("open")) {
      throw new IcelandPreflightError("named_holds", `Closed gap ${gap.gap_id} must stay closed as supplied.`, intendedInventory);
    }
  }

  const review = JSON.parse(readFileSync(reviewItem.absPath, "utf8")) as {
    applied_changes: number;
    approvals: Record<string, boolean>;
  };
  const approvalValues = Object.values(review.approvals ?? {});
  if (review.applied_changes !== 0 || approvalValues.length === 0 || approvalValues.some((value) => value !== false)) {
    throw new IcelandPreflightError(
      "coverage",
      "Iceland human-review.json must stay applied_changes 0 with every approval false.",
      intendedInventory,
    );
  }
  const metadataFile = JSON.parse(readFileSync(metadataItem.absPath, "utf8")) as {
    applied_changes: number;
    justin_approved: boolean;
    research_coverage_complete?: boolean;
  };
  if (metadataFile.applied_changes !== 0 || metadataFile.justin_approved !== false) {
    throw new IcelandPreflightError("coverage", "Iceland metadata.json must stay applied_changes 0 and justin_approved false.", intendedInventory);
  }
  if (metadataFile.research_coverage_complete !== undefined && metadataFile.research_coverage_complete !== false) {
    throw new IcelandPreflightError("coverage", "Iceland research_coverage_complete must stay false.", intendedInventory);
  }

  const metadata = {
    research_coverage_complete: false,
    applied_changes: 0,
    justin_approved: false,
  };

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
    geographies,
    crosswalks,
    gaps,
    metadata,
    intendedInventory,
  };
}

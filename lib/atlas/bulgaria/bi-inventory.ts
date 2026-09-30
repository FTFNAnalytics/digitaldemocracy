import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  CANONICALIZATION,
  HASH_ALGORITHM,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
  SCHEMA_VERSION,
  sortByInputPath,
  type HashInputDescriptor,
  type SchemaInputDescriptor,
} from "../identity";
import {
  APPROVED_TIER_PATH,
  BI_ACCEPTANCE_RELATIVE,
  BI_ACCEPTANCE_SHA256,
  BI_ADAPTER_VERSION,
  BI_COUNTS_RELATIVE,
  BI_COUNTS_SHA256,
  BI_DRAFT_OFFICE_IDS,
  BI_EXPECTED_COUNTS,
  BI_OFFICE_REGISTER_RELATIVE,
  BI_OFFICE_REGISTER_SHA256,
  BI_OMITTED_EVENT_PATHS,
  BI_RECONCILIATION_RELATIVE,
  BI_RECONCILIATION_SHA256,
  BI_RESEARCH_GAPS_RELATIVE,
  BI_RESEARCH_GAPS_SHA256,
  BI_SCHEMA_TIER_SHA256,
  BI_SLIM_NOTE_RELATIVE,
  BI_SLIM_NOTE_SHA256,
  BI_SUCCESSOR_LINKS_RELATIVE,
  BI_SUCCESSOR_LINKS_SHA256,
  BI_UPCOMING_CALENDAR_SHA256,
  GRADEC_OFFICE_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  canonical,
  geographyIdFor,
  releaseIdFor,
  sha256Hex,
} from "./identity";

export class BulgariaBiPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

export type BulgariaBiRegisterRow = {
  office_id: string;
  country_code: string;
  jurisdiction: string;
  office: string;
  lifecycle: string;
  family: string;
  tier: string;
  scope_disposition: string;
  geography_id: string | null;
  new_BI_approval: boolean;
  register_index: number;
};

export type BulgariaBiClassification = {
  office_id: string;
  tier: string;
  draft_tier: string;
  rationale: string;
  production_disposition: "inherited_P_accepted" | "draft_pending_Justin" | "hold";
  justin_approved: boolean;
  applied: boolean;
  human_review_required: boolean;
  tier_index: number;
};

export type BulgariaBiGap = {
  hold_id: string;
  title: string;
  finding: string;
  status: string;
  justin_approved: boolean;
  source_index: number;
};

export type BulgariaBiInventory = {
  root: string;
  tracked: Array<HashInputDescriptor & { absPath: string }>;
  byPath: Map<string, HashInputDescriptor>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  offices: BulgariaBiRegisterRow[];
  tiers: BulgariaBiClassification[];
  gaps: BulgariaBiGap[];
  inheritedIds: string[];
  holdIds: string[];
  draftIds: string[];
  upcomingCalendarRows: number;
};

const PINNED: Readonly<Record<string, string>> = {
  [TIER_PATH]: BI_SCHEMA_TIER_SHA256,
  [APPROVED_TIER_PATH]: TIER_SHA256,
  [BI_OFFICE_REGISTER_RELATIVE]: BI_OFFICE_REGISTER_SHA256,
  [BI_COUNTS_RELATIVE]: BI_COUNTS_SHA256,
  [BI_RESEARCH_GAPS_RELATIVE]: BI_RESEARCH_GAPS_SHA256,
  [BI_ACCEPTANCE_RELATIVE]: BI_ACCEPTANCE_SHA256,
  [BI_SLIM_NOTE_RELATIVE]: BI_SLIM_NOTE_SHA256,
  [BI_RECONCILIATION_RELATIVE]: BI_RECONCILIATION_SHA256,
  [BI_SUCCESSOR_LINKS_RELATIVE]: BI_SUCCESSOR_LINKS_SHA256,
  [UPCOMING_CALENDAR_RELATIVE]: BI_UPCOMING_CALENDAR_SHA256,
};

const DRAFT_SET = new Set<string>(BI_DRAFT_OFFICE_IDS);

function gitTracked(root: string, spec: string): boolean {
  const output = execFileSync("git", ["-C", root, "ls-files", "-z", "--", spec], { encoding: "buffer" });
  const paths = output
    .toString("utf8")
    .split("\0")
    .filter((rel) => Boolean(rel));
  return paths.length === 1 && paths[0] === spec;
}

function inputKind(inputPath: string): HashInputDescriptor["input_kind"] {
  if (inputPath === TIER_PATH) return "tier_classification";
  return "package";
}

function readPinned(root: string, rel: string): { bytes: Buffer; text: string; sha256: string } {
  if (!gitTracked(root, rel)) {
    throw new BulgariaBiPreflightError("untracked_input", `Bulgaria BI input is not git-tracked: ${rel}`, {
      lineage_id: LINEAGE_ID,
      input_path: rel,
    });
  }
  const abs = path.join(root, rel);
  const bytes = readFileSync(abs);
  const sha256 = sha256Hex(bytes);
  const expected = PINNED[rel];
  if (sha256 !== expected) {
    throw new BulgariaBiPreflightError(
      "input_hash_mismatch",
      `Bulgaria BI input ${rel} SHA-256 ${sha256} !== ${expected}`,
      { lineage_id: LINEAGE_ID, input_path: rel, sha256, expected },
    );
  }
  return { bytes, text: bytes.toString("utf8"), sha256 };
}

export function scanBulgariaBiInventory(options: { root: string }): BulgariaBiInventory {
  const root = options.root;
  const intended = { lineage_id: LINEAGE_ID, adapter_version: BI_ADAPTER_VERSION, tier_path: TIER_PATH };
  for (const omitted of BI_OMITTED_EVENT_PATHS) {
    if (PINNED[omitted]) {
      throw new BulgariaBiPreflightError("omitted_input", `Omitted BI path was pinned: ${omitted}`, intended);
    }
  }
  if (!existsSync(path.join(root, "docs/phase1/bulgaria/data/BI_New_Events.json"))) {
    throw new BulgariaBiPreflightError(
      "omitted_input",
      "Documentary BI events file is missing; do not invent a replacement.",
      intended,
    );
  }
  if (!existsSync(path.join(root, "docs/phase1/bulgaria/data/BI_New_Results.json"))) {
    throw new BulgariaBiPreflightError(
      "omitted_input",
      "Documentary BI results file is missing; do not invent a replacement.",
      intended,
    );
  }

  const tracked: BulgariaBiInventory["tracked"] = [];
  for (const rel of Object.keys(PINNED).sort()) {
    const file = readPinned(root, rel);
    tracked.push({
      input_path: rel,
      input_kind: inputKind(rel),
      sha256: file.sha256,
      byte_count: file.bytes.length,
      absPath: path.join(root, rel),
    });
  }
  if (tracked.length !== BI_EXPECTED_COUNTS.retained_inputs) {
    throw new BulgariaBiPreflightError(
      "retained_input_count",
      `Expected ${BI_EXPECTED_COUNTS.retained_inputs} BI inputs, found ${tracked.length}.`,
      intended,
    );
  }
  for (const omitted of ["docs/phase1/bulgaria/data/BI_New_Events.json", "docs/phase1/bulgaria/data/BI_New_Results.json"]) {
    if (tracked.some((item) => item.input_path === omitted)) {
      throw new BulgariaBiPreflightError("omitted_input", `BI publication must not retain ${omitted}`, intended);
    }
  }

  const schemaInputs: SchemaInputDescriptor[] = sortByInputPath([
    { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
    { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
  ]);
  const hashInputs = {
    canonicalization: CANONICALIZATION,
    hash_algorithm: HASH_ALGORITHM,
    lineage_id: LINEAGE_ID,
    inputs: sortByInputPath(tracked.map(({ input_path, input_kind, sha256, byte_count }) => ({
      input_path,
      input_kind,
      sha256,
      byte_count,
    }))),
    overrides: [] as HashInputDescriptor[],
    adapter_version: BI_ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: schemaInputs,
  };
  const fingerprint = sha256Hex(canonical(hashInputs));
  const releaseId = releaseIdFor(fingerprint);

  const tierJson = JSON.parse(readFileSync(path.join(root, TIER_PATH), "utf8")) as {
    status?: string;
    applied_changes?: number;
    counts_by_production_disposition?: Record<string, number>;
    counts_by_proposed_tier?: Record<string, number>;
    importer_policy?: Record<string, unknown>;
    approval?: { Justin?: { approved?: boolean } };
    classifications?: Array<Record<string, unknown>>;
  };
  if (tierJson.status !== "draft" || tierJson.applied_changes !== 0 || tierJson.approval?.Justin?.approved !== false) {
    throw new BulgariaBiPreflightError(
      "tier_not_draft",
      "Prompt BI tiers must stay draft with Justin approval and applied_changes unchecked.",
      intended,
    );
  }
  if (tierJson.importer_policy?.publish_hold !== false || tierJson.importer_policy?.publish_inherited_P_accepted !== true) {
    throw new BulgariaBiPreflightError("importer_policy", "BI importer policy must publish inherited rows and withhold holds.", intended);
  }
  if (tierJson.importer_policy?.publish_draft_pending_Justin_as_needs_review !== true) {
    throw new BulgariaBiPreflightError(
      "importer_policy",
      "BI importer policy must publish the four drafts as needs_review.",
      intended,
    );
  }
  const classifications = tierJson.classifications ?? [];
  if (classifications.length !== BI_EXPECTED_COUNTS.register_rows) {
    throw new BulgariaBiPreflightError("tier_count", `BI tier rows ${classifications.length}`, intended);
  }
  const dispositionCounts = { inherited_P_accepted: 0, draft_pending_Justin: 0, hold: 0 };
  const tiers: BulgariaBiClassification[] = [];
  for (let index = 0; index < classifications.length; index += 1) {
    const row = classifications[index]!;
    const officeId = String(row.office_id ?? "");
    const disposition = String(row.production_disposition ?? "");
    if (disposition !== "inherited_P_accepted" && disposition !== "draft_pending_Justin" && disposition !== "hold") {
      throw new BulgariaBiPreflightError("tier_disposition", `Unexpected disposition ${disposition} on ${officeId}`, intended);
    }
    dispositionCounts[disposition] += 1;
    if (row.justin_approved !== false || row.applied !== false) {
      throw new BulgariaBiPreflightError(
        "tier_approval",
        `Office ${officeId} must stay justin_approved false and applied false.`,
        intended,
      );
    }
    const tier = String(row.tier ?? "");
    if (tier === "regional" || row.draft_tier === "regional" || row.schema_v1_tier === "regional") {
      throw new BulgariaBiPreflightError("regional_tier", `Regional tier invented for ${officeId}`, intended);
    }
    if (row.draft_tier !== tier) {
      throw new BulgariaBiPreflightError("tier_drift", `draft_tier drifted for ${officeId}`, intended);
    }
    const rationale = String(row.rationale ?? "").trim();
    if (!rationale) {
      throw new BulgariaBiPreflightError("tier_rationale", `Missing rationale for ${officeId}`, intended);
    }
    tiers.push({
      office_id: officeId,
      tier,
      draft_tier: tier,
      rationale,
      production_disposition: disposition,
      justin_approved: false,
      applied: false,
      human_review_required: row.human_review_required === true,
      tier_index: index,
    });
  }
  if (
    dispositionCounts.inherited_P_accepted !== BI_EXPECTED_COUNTS.inherited_offices ||
    dispositionCounts.draft_pending_Justin !== BI_EXPECTED_COUNTS.draft_offices ||
    dispositionCounts.hold !== BI_EXPECTED_COUNTS.held_offices
  ) {
    throw new BulgariaBiPreflightError("tier_histogram", `BI disposition histogram ${JSON.stringify(dispositionCounts)}`, intended);
  }
  if (
    tierJson.counts_by_production_disposition?.inherited_P_accepted !== 530 ||
    tierJson.counts_by_production_disposition?.draft_pending_Justin !== 4 ||
    tierJson.counts_by_production_disposition?.hold !== 3067 ||
    tierJson.counts_by_proposed_tier?.municipal !== 3597 ||
    tierJson.counts_by_proposed_tier?.national !== 3 ||
    tierJson.counts_by_proposed_tier?.other !== 1
  ) {
    throw new BulgariaBiPreflightError("tier_histogram", "BI tier count block drifted.", intended);
  }

  const register = JSON.parse(readFileSync(path.join(root, BI_OFFICE_REGISTER_RELATIVE), "utf8")) as Array<
    Record<string, unknown>
  >;
  if (!Array.isArray(register) || register.length !== BI_EXPECTED_COUNTS.register_rows) {
    throw new BulgariaBiPreflightError("register_count", "BI office register length drifted.", intended);
  }
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));
  const offices: BulgariaBiRegisterRow[] = [];
  const seen = new Set<string>();
  let mayors = 0;
  let councils = 0;
  for (let index = 0; index < register.length; index += 1) {
    const row = register[index]!;
    const officeId = String(row.office_id ?? "");
    if (!officeId || seen.has(officeId)) {
      throw new BulgariaBiPreflightError("register_id", `Duplicate or blank office ${officeId}`, intended);
    }
    seen.add(officeId);
    if (row.country_code !== "BG" || row.new_BI_approval !== false) {
      throw new BulgariaBiPreflightError("register_row", `Office ${officeId} left the BG register or flipped BI approval.`, intended);
    }
    const scope = String(row.scope_disposition ?? "");
    const tier = tierById.get(officeId);
    if (!tier) throw new BulgariaBiPreflightError("register_tier", `Register office ${officeId} has no tier.`, intended);
    const lifecycle = String(row.lifecycle ?? "");
    const geographyId = row.geography_id == null ? null : String(row.geography_id);
    if (scope === "inherited_P_accepted") {
      if (tier.production_disposition !== "inherited_P_accepted") {
        throw new BulgariaBiPreflightError("register_tier", `Inherited ${officeId} disposition drifted.`, intended);
      }
      if (lifecycle !== "current_baseline" || tier.tier !== "municipal") {
        throw new BulgariaBiPreflightError("register_row", `Inherited ${officeId} is not a current municipal baseline row.`, intended);
      }
      if (!geographyId || geographyId !== geographyIdFor(officeId)) {
        throw new BulgariaBiPreflightError(
          "geography_id",
          `Inherited ${officeId} geography must stay ${geographyIdFor(officeId)}.`,
          intended,
        );
      }
      const officeType = String(row.office ?? "");
      if (officeType === "Mayor") mayors += 1;
      else if (officeType === "Municipal council") councils += 1;
      else throw new BulgariaBiPreflightError("office_type", `Inherited ${officeId} office type ${officeType}`, intended);
    } else if (scope === "hold_submunicipal_scope") {
      if (tier.production_disposition !== "hold" || lifecycle !== "held_baseline_not_2027_eligibility") {
        throw new BulgariaBiPreflightError("register_tier", `Hold ${officeId} disposition drifted.`, intended);
      }
    } else if (scope === "BI_draft_current" || scope === "BI_draft_historical") {
      if (tier.production_disposition !== "draft_pending_Justin" || !DRAFT_SET.has(officeId)) {
        throw new BulgariaBiPreflightError("register_tier", `Draft ${officeId} is outside the four BI offices.`, intended);
      }
      if (geographyId != null) {
        throw new BulgariaBiPreflightError("geography_id", `Draft ${officeId} must not invent a source geography id.`, intended);
      }
      if (scope === "BI_draft_historical" && lifecycle !== "historical_only") {
        throw new BulgariaBiPreflightError("register_row", `Historical draft ${officeId} lifecycle drifted.`, intended);
      }
      if (scope === "BI_draft_current" && lifecycle !== "current") {
        throw new BulgariaBiPreflightError("register_row", `Current draft ${officeId} lifecycle drifted.`, intended);
      }
    } else {
      throw new BulgariaBiPreflightError("register_scope", `Unexpected scope ${scope} on ${officeId}`, intended);
    }
    offices.push({
      office_id: officeId,
      country_code: "BG",
      jurisdiction: String(row.jurisdiction ?? ""),
      office: String(row.office ?? ""),
      lifecycle,
      family: String(row.family ?? ""),
      tier: String(row.tier ?? ""),
      scope_disposition: scope,
      geography_id: geographyId,
      new_BI_approval: false,
      register_index: index,
    });
  }
  if (mayors !== BI_EXPECTED_COUNTS.mayor_offices || councils !== BI_EXPECTED_COUNTS.municipal_council_offices) {
    throw new BulgariaBiPreflightError("office_type", `Inherited mayor/council counts ${mayors}/${councils}`, intended);
  }
  if (tierById.size !== offices.length) {
    throw new BulgariaBiPreflightError("register_tier", "Tier and register ID sets diverged.", intended);
  }

  const approved = JSON.parse(readFileSync(path.join(root, APPROVED_TIER_PATH), "utf8")) as {
    status?: string;
    classifications?: Array<{ office_id?: string; human_review_required?: boolean }>;
  };
  if (approved.status !== "approved") {
    throw new BulgariaBiPreflightError("approved_tier", "Prompt P preserved tiers must stay approved.", intended);
  }
  const preservedAccepted = new Set(
    (approved.classifications ?? [])
      .filter((row) => row.human_review_required === false)
      .map((row) => String(row.office_id)),
  );
  const preservedHeld = new Set(
    (approved.classifications ?? [])
      .filter((row) => row.human_review_required === true)
      .map((row) => String(row.office_id)),
  );
  const inheritedIds = offices.filter((row) => row.scope_disposition === "inherited_P_accepted").map((row) => row.office_id);
  const holdIds = offices.filter((row) => row.scope_disposition === "hold_submunicipal_scope").map((row) => row.office_id);
  const draftIds = offices
    .filter((row) => row.scope_disposition === "BI_draft_current" || row.scope_disposition === "BI_draft_historical")
    .map((row) => row.office_id)
    .sort();
  if (preservedAccepted.size !== 530 || preservedHeld.size !== 3067) {
    throw new BulgariaBiPreflightError("approved_tier", "Prompt P accepted/held split drifted.", intended);
  }
  if (
    inheritedIds.length !== 530 ||
    holdIds.length !== 3067 ||
    inheritedIds.some((id) => !preservedAccepted.has(id)) ||
    holdIds.some((id) => !preservedHeld.has(id)) ||
    [...preservedAccepted].some((id) => !inheritedIds.includes(id))
  ) {
    throw new BulgariaBiPreflightError(
      "identity_preservation",
      "BI inherited and hold IDs must match the Prompt P accepted and held sets exactly.",
      intended,
    );
  }
  if (!holdIds.includes(GRADEC_OFFICE_ID)) {
    throw new BulgariaBiPreflightError("gradec_hold", "Градец 2015 must stay a hold.", intended);
  }
  if (draftIds.join("|") !== [...BI_DRAFT_OFFICE_IDS].join("|")) {
    throw new BulgariaBiPreflightError("draft_ids", `Draft office IDs drifted: ${draftIds.join(",")}`, intended);
  }
  const draftTiers = new Map(tiers.filter((row) => row.production_disposition === "draft_pending_Justin").map((row) => [row.office_id, row.tier]));
  if (
    draftTiers.get("BG-NATIONAL-ASSEMBLY") !== "national" ||
    draftTiers.get("BG-PRESIDENT-JOINT-TICKET") !== "national" ||
    draftTiers.get("BG-GRAND-NATIONAL-ASSEMBLY-1990") !== "national" ||
    draftTiers.get("BG-EUROPEAN-PARLIAMENT") !== "other"
  ) {
    throw new BulgariaBiPreflightError("draft_tier", "National/EP/GNA draft tiers drifted.", intended);
  }

  const gapsJson = JSON.parse(readFileSync(path.join(root, BI_RESEARCH_GAPS_RELATIVE), "utf8")) as Array<
    Record<string, unknown>
  >;
  if (!Array.isArray(gapsJson) || gapsJson.length !== BI_EXPECTED_COUNTS.named_open_holds) {
    throw new BulgariaBiPreflightError("named_holds", "Bulgaria G01–G16 hold list drifted.", intended);
  }
  const gaps: BulgariaBiGap[] = gapsJson.map((row, index) => ({
    hold_id: String(row.hold_id ?? ""),
    title: String(row.title ?? ""),
    finding: String(row.finding ?? ""),
    status: String(row.status ?? ""),
    justin_approved: row.justin_approved === true,
    source_index: index,
  }));
  if (
    gaps.some((gap, index) => gap.hold_id !== `G${String(index + 1).padStart(2, "0")}`) ||
    gaps.some((gap) => gap.status !== "research_hold" || gap.justin_approved || !gap.finding.trim())
  ) {
    throw new BulgariaBiPreflightError("named_holds", "A Bulgaria research hold was closed or renumbered.", intended);
  }

  const successors = JSON.parse(readFileSync(path.join(root, BI_SUCCESSOR_LINKS_RELATIVE), "utf8")) as unknown;
  if (!Array.isArray(successors) || successors.length !== 0) {
    throw new BulgariaBiPreflightError("successor_links", "Bulgaria successor links must stay empty.", intended);
  }
  const reconciliation = JSON.parse(readFileSync(path.join(root, BI_RECONCILIATION_RELATIVE), "utf8")) as {
    P_accepted_ids_preserved?: number;
    P_holds_preserved?: number;
    municipal_adds?: unknown[];
    municipal_removes?: unknown[];
    successor_edges?: unknown[];
    new_BI_office_ids?: string[];
  };
  if (
    reconciliation.P_accepted_ids_preserved !== 530 ||
    reconciliation.P_holds_preserved !== 3067 ||
    (reconciliation.municipal_adds ?? []).length !== 0 ||
    (reconciliation.municipal_removes ?? []).length !== 0 ||
    (reconciliation.successor_edges ?? []).length !== 0 ||
    [...(reconciliation.new_BI_office_ids ?? [])].sort().join("|") !== [...BI_DRAFT_OFFICE_IDS].join("|")
  ) {
    throw new BulgariaBiPreflightError("reconciliation", "Bulgaria reconciliation no longer preserves the 530.", intended);
  }

  const calendar = JSON.parse(readFileSync(path.join(root, UPCOMING_CALENDAR_RELATIVE), "utf8")) as Array<
    Record<string, unknown>
  >;
  if (!Array.isArray(calendar) || calendar.length !== BI_EXPECTED_COUNTS.upcoming_calendar_rows) {
    throw new BulgariaBiPreflightError("calendar", "Bulgaria upcoming calendar row count drifted.", intended);
  }
  if (calendar.some((row) => row.justin_approved !== false)) {
    throw new BulgariaBiPreflightError("calendar", "Upcoming calendar Justin approval must stay unchecked.", intended);
  }

  const counts = JSON.parse(readFileSync(path.join(root, BI_COUNTS_RELATIVE), "utf8")) as Record<string, unknown>;
  if (
    counts.inherited_P_accepted_municipality_wide !== 530 ||
    counts.held_submunicipal !== 3067 ||
    counts.new_current_national !== 2 ||
    counts.new_current_EP !== 1 ||
    counts.historical_only_offices !== 1 ||
    counts.regional_offices !== 0 ||
    counts.applied_changes !== 0 ||
    counts.all_BI_approvals_unchecked !== true ||
    counts.successor_links !== 0
  ) {
    throw new BulgariaBiPreflightError("counts", "Bulgaria counts file no longer matches the additive BI split.", intended);
  }

  return {
    root,
    tracked,
    byPath: new Map(tracked.map((item) => [item.input_path, item])),
    fingerprint,
    releaseId,
    hashInputsJson: canonical(hashInputs),
    offices,
    tiers,
    gaps,
    inheritedIds,
    holdIds,
    draftIds,
    upcomingCalendarRows: calendar.length,
  };
}

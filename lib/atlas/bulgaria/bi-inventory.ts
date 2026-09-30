import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  BI_ADAPTER_VERSION,
  BI_DRAFT_OFFICE_IDS,
  BI_SCHEMA_TIER_SHA256,
  COUNTS_RELATIVE,
  COUNTS_SHA256,
  DRAFT_TIERS_RELATIVE,
  DRAFT_TIERS_SHA256,
  EXPECTED_BI_COUNTS,
  GRADEC_OFFICE_ID,
  LINEAGE_ID,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  OMITTED_PATHS,
  OPEN_HOLD_IDS,
  PROMPT_P_TIER_PATH,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_GAPS_SHA256,
  SUCCESSOR_LINKS_RELATIVE,
  SUCCESSOR_LINKS_SHA256,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  UPCOMING_CALENDAR_SHA256,
  buildBiHashInputs,
  canonical,
  fingerprintSha256,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
} from "./bi-identity";
import { geographyIdFor } from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type BulgariaBiRegisterRow = {
  office_id: string;
  country_code: string;
  jurisdiction: string;
  office: string;
  lifecycle: string;
  family: string;
  tier: string;
  selection_mode: string;
  scope_disposition: string;
  seats: number | null;
  geography_id: string | null;
  source_id: string;
  new_BI_approval: boolean;
  note: string | null;
  register_index: number;
};

export type BulgariaBiTierRow = {
  office_id: string;
  tier: string;
  draft_tier: string;
  production_disposition: string;
  rationale: string;
  human_review_required: boolean;
  justin_approved: boolean;
  applied: boolean;
  new_BI_approval: boolean;
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

export class BulgariaBiPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

export type BulgariaBiInventory = {
  root: string;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  offices: BulgariaBiRegisterRow[];
  tiers: BulgariaBiTierRow[];
  gaps: BulgariaBiGap[];
  preservedIds: string[];
  intendedInventory: Record<string, unknown>;
};

const PINNED: ReadonlyArray<readonly [string, string]> = [
  [TIER_PATH, BI_SCHEMA_TIER_SHA256],
  [OFFICE_REGISTER_RELATIVE, OFFICE_REGISTER_SHA256],
  [DRAFT_TIERS_RELATIVE, DRAFT_TIERS_SHA256],
  [COUNTS_RELATIVE, COUNTS_SHA256],
  [RESEARCH_GAPS_RELATIVE, RESEARCH_GAPS_SHA256],
  [PROMPT_P_TIER_PATH, TIER_SHA256],
  [SUCCESSOR_LINKS_RELATIVE, SUCCESSOR_LINKS_SHA256],
  [UPCOMING_CALENDAR_RELATIVE, UPCOMING_CALENDAR_SHA256],
];

function readPinned(root: string, relativePath: string, expectedSha: string): TrackedInput {
  const absPath = path.join(root, relativePath);
  if (!existsSync(absPath)) {
    throw new BulgariaBiPreflightError("missing_input", `Missing ${relativePath}`, { lineage_id: LINEAGE_ID });
  }
  const bytes = readFileSync(absPath);
  const sha256 = sha256Hex(bytes);
  if (sha256 !== expectedSha) {
    throw new BulgariaBiPreflightError(
      "hash_mismatch",
      `${relativePath} SHA-256 mismatch; expected ${expectedSha}.`,
      { lineage_id: LINEAGE_ID, input_path: relativePath, sha256 },
    );
  }
  return {
    input_path: relativePath,
    input_kind: inputKindFor(relativePath),
    sha256,
    byte_count: bytes.length,
    absPath,
  };
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

export function scanBulgariaBiInventory(options: { root: string }): BulgariaBiInventory {
  const root = options.root;
  for (const omitted of OMITTED_PATHS) {
    const abs = path.join(root, omitted);
    if (!existsSync(abs)) {
      throw new BulgariaBiPreflightError(
        "omitted_missing",
        `Slim-land omission ${omitted} is not on disk; refusing to invent it.`,
        { lineage_id: LINEAGE_ID },
      );
    }
  }

  const tracked = PINNED.map(([relativePath, sha]) => readPinned(root, relativePath, sha));
  const byPath = new Map(tracked.map((item) => [item.input_path, item]));
  const readJson = (relativePath: string): unknown => {
    const item = byPath.get(relativePath);
    if (!item) throw new Error(`Missing tracked input ${relativePath}`);
    return JSON.parse(readFileSync(item.absPath, "utf8")) as unknown;
  };

  const counts = asRecord(readJson(COUNTS_RELATIVE), "counts");
  if (
    counts.applied_changes !== 0 ||
    counts.research_coverage_complete !== false ||
    counts.all_BI_approvals_unchecked !== true ||
    counts.inherited_P_accepted_municipality_wide !== EXPECTED_BI_COUNTS.preserved_offices ||
    counts.held_submunicipal !== EXPECTED_BI_COUNTS.held_offices ||
    counts.regional_offices !== 0 ||
    counts.successor_links !== 0 ||
    counts.historical_only_offices !== 1 ||
    counts.new_current_national !== 2 ||
    counts.new_current_EP !== 1 ||
    counts.office_register_rows !== EXPECTED_BI_COUNTS.register_rows
  ) {
    throw new BulgariaBiPreflightError("counts", "Bulgaria BI counts file drifted from the additive contract.", {
      lineage_id: LINEAGE_ID,
    });
  }

  const registerJson = readJson(OFFICE_REGISTER_RELATIVE);
  if (!Array.isArray(registerJson)) {
    throw new BulgariaBiPreflightError("register", "Bulgaria office register must be an array.", { lineage_id: LINEAGE_ID });
  }
  const offices: BulgariaBiRegisterRow[] = registerJson.map((value, register_index) => {
    const row = asRecord(value, `register ${register_index}`);
    return {
      office_id: String(row.office_id ?? ""),
      country_code: String(row.country_code ?? ""),
      jurisdiction: String(row.jurisdiction ?? ""),
      office: String(row.office ?? ""),
      lifecycle: String(row.lifecycle ?? ""),
      family: String(row.family ?? ""),
      tier: String(row.tier ?? ""),
      selection_mode: String(row.selection_mode ?? ""),
      scope_disposition: String(row.scope_disposition ?? ""),
      seats: typeof row.seats === "number" ? row.seats : null,
      geography_id: typeof row.geography_id === "string" ? row.geography_id : null,
      source_id: String(row.source_id ?? ""),
      new_BI_approval: row.new_BI_approval === true,
      note: typeof row.note === "string" ? row.note : null,
      register_index,
    };
  });
  if (offices.length !== EXPECTED_BI_COUNTS.register_rows) {
    throw new BulgariaBiPreflightError("register", "Bulgaria office register row count drifted.", { lineage_id: LINEAGE_ID });
  }

  const schema = asRecord(readJson(TIER_PATH), "schema tiers");
  if (schema.status !== "draft" || schema.applied_changes !== 0 || schema.prompt !== "BI") {
    throw new BulgariaBiPreflightError("tier_status", "Bulgaria schema tiers must stay the unapproved Prompt BI draft.", {
      lineage_id: LINEAGE_ID,
    });
  }
  const classifications = schema.classifications;
  if (!Array.isArray(classifications) || classifications.length !== EXPECTED_BI_COUNTS.register_rows) {
    throw new BulgariaBiPreflightError("tier_count", "Bulgaria schema tier row count drifted.", { lineage_id: LINEAGE_ID });
  }
  const tiers: BulgariaBiTierRow[] = classifications.map((value, tier_index) => {
    const row = asRecord(value, `tier ${tier_index}`);
    return {
      office_id: String(row.office_id ?? ""),
      tier: String(row.tier ?? ""),
      draft_tier: String(row.draft_tier ?? row.tier ?? ""),
      production_disposition: String(row.production_disposition ?? ""),
      rationale: String(row.rationale ?? ""),
      human_review_required: row.human_review_required === true,
      justin_approved: row.justin_approved === true,
      applied: row.applied === true,
      new_BI_approval: row.new_BI_approval === true,
      tier_index,
    };
  });

  const draftFile = asRecord(readJson(DRAFT_TIERS_RELATIVE), "draft tiers");
  const draftRows = draftFile.classifications ?? draftFile.tiers ?? draftFile.rows;
  if (!Array.isArray(draftRows) || draftRows.length !== EXPECTED_BI_COUNTS.register_rows) {
    throw new BulgariaBiPreflightError("draft_tiers", "Bulgaria_Draft_Tiers.json row count drifted.", {
      lineage_id: LINEAGE_ID,
    });
  }
  const draftById = new Map<string, { tier: string; production_disposition: string }>();
  for (const value of draftRows) {
    const row = asRecord(value, "draft tier row");
    const officeId = String(row.office_id ?? "");
    draftById.set(officeId, {
      tier: String(row.tier ?? ""),
      production_disposition: String(row.production_disposition ?? ""),
    });
  }

  const promptP = asRecord(readJson(PROMPT_P_TIER_PATH), "Prompt P tiers");
  if (promptP.status !== "approved") {
    throw new BulgariaBiPreflightError("prompt_p", "Preserved Prompt P tiers must stay approved.", { lineage_id: LINEAGE_ID });
  }
  const promptPRows = promptP.classifications;
  if (!Array.isArray(promptPRows)) {
    throw new BulgariaBiPreflightError("prompt_p", "Prompt P classifications are missing.", { lineage_id: LINEAGE_ID });
  }
  const preservedIds: string[] = [];
  for (const value of promptPRows) {
    const row = asRecord(value, "Prompt P row");
    if (row.human_review_required === false) preservedIds.push(String(row.office_id ?? ""));
  }
  if (preservedIds.length !== EXPECTED_BI_COUNTS.preserved_offices) {
    throw new BulgariaBiPreflightError("prompt_p", "Prompt P accepted ID count drifted.", { lineage_id: LINEAGE_ID });
  }
  const preserved = new Set(preservedIds);

  const registerById = new Map(offices.map((row) => [row.office_id, row]));
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));
  if (registerById.size !== offices.length || tierById.size !== tiers.length) {
    throw new BulgariaBiPreflightError("identity", "Bulgaria BI office IDs are not unique.", { lineage_id: LINEAGE_ID });
  }

  let held = 0;
  let inherited = 0;
  let drafts = 0;
  for (const office of offices) {
    if (office.country_code !== "BG" || office.new_BI_approval) {
      throw new BulgariaBiPreflightError("register", `Office ${office.office_id} must stay BG and unchecked.`, {
        lineage_id: LINEAGE_ID,
      });
    }
    const tier = tierById.get(office.office_id);
    const draft = draftById.get(office.office_id);
    if (!tier || !draft) {
      throw new BulgariaBiPreflightError("identity", `Office ${office.office_id} is missing a tier row.`, {
        lineage_id: LINEAGE_ID,
      });
    }
    if (tier.justin_approved || tier.applied || tier.new_BI_approval || !tier.rationale.trim()) {
      throw new BulgariaBiPreflightError(
        "approval",
        `Office ${office.office_id} must stay justin_approved false, applied false, and unapproved.`,
        { lineage_id: LINEAGE_ID },
      );
    }
    if (draft.tier !== tier.tier || draft.production_disposition !== tier.production_disposition) {
      throw new BulgariaBiPreflightError("draft_tiers", `Office ${office.office_id} draft tier does not match the schema file.`, {
        lineage_id: LINEAGE_ID,
      });
    }
    if (office.scope_disposition === "hold_submunicipal_scope") {
      if (tier.production_disposition !== "hold") {
        throw new BulgariaBiPreflightError("hold", `Held office ${office.office_id} disposition drifted.`, { lineage_id: LINEAGE_ID });
      }
      held += 1;
    } else if (office.scope_disposition === "inherited_P_accepted") {
      if (tier.production_disposition !== "inherited_P_accepted" || !preserved.has(office.office_id)) {
        throw new BulgariaBiPreflightError("preserved", `Office ${office.office_id} is not a preserved Prompt P ID.`, {
          lineage_id: LINEAGE_ID,
        });
      }
      if (office.geography_id !== geographyIdFor(office.office_id)) {
        throw new BulgariaBiPreflightError(
          "geography",
          `Preserved office ${office.office_id} geography_id does not match the Prompt P key.`,
          { lineage_id: LINEAGE_ID },
        );
      }
      if (office.tier !== "municipal" || office.lifecycle !== "current_baseline") {
        throw new BulgariaBiPreflightError("preserved", `Preserved office ${office.office_id} lifecycle drifted.`, {
          lineage_id: LINEAGE_ID,
        });
      }
      inherited += 1;
    } else if (office.scope_disposition === "BI_draft_current" || office.scope_disposition === "BI_draft_historical") {
      if (tier.production_disposition !== "draft_pending_Justin" || preserved.has(office.office_id)) {
        throw new BulgariaBiPreflightError("draft", `Draft office ${office.office_id} disposition drifted.`, {
          lineage_id: LINEAGE_ID,
        });
      }
      if (office.geography_id != null) {
        throw new BulgariaBiPreflightError("geography", `Draft office ${office.office_id} must keep a null geography_id.`, {
          lineage_id: LINEAGE_ID,
        });
      }
      drafts += 1;
    } else {
      throw new BulgariaBiPreflightError("register", `Unexpected disposition ${office.scope_disposition}.`, {
        lineage_id: LINEAGE_ID,
      });
    }
  }
  if (
    held !== EXPECTED_BI_COUNTS.held_offices ||
    inherited !== EXPECTED_BI_COUNTS.preserved_offices ||
    drafts !== EXPECTED_BI_COUNTS.bi_draft_offices
  ) {
    throw new BulgariaBiPreflightError("counts", `Disposition counts ${inherited}/${drafts}/${held} drifted.`, {
      lineage_id: LINEAGE_ID,
    });
  }
  for (const officeId of preserved) {
    if (registerById.get(officeId)?.scope_disposition !== "inherited_P_accepted") {
      throw new BulgariaBiPreflightError("preserved", `Prompt P office ${officeId} is missing from the BI register.`, {
        lineage_id: LINEAGE_ID,
      });
    }
  }
  for (const officeId of BI_DRAFT_OFFICE_IDS) {
    const office = registerById.get(officeId);
    if (!office || (office.scope_disposition !== "BI_draft_current" && office.scope_disposition !== "BI_draft_historical")) {
      throw new BulgariaBiPreflightError("draft", `Required draft office ${officeId} is missing.`, { lineage_id: LINEAGE_ID });
    }
  }
  const gradec = registerById.get(GRADEC_OFFICE_ID);
  if (!gradec || gradec.scope_disposition !== "hold_submunicipal_scope") {
    throw new BulgariaBiPreflightError("hold", "Градец 2015 must stay a submunicipal hold.", { lineage_id: LINEAGE_ID });
  }

  const successors = readJson(SUCCESSOR_LINKS_RELATIVE);
  if (!Array.isArray(successors) || successors.length !== 0) {
    throw new BulgariaBiPreflightError("successor", "Successor links must stay an empty array.", { lineage_id: LINEAGE_ID });
  }
  const calendar = readJson(UPCOMING_CALENDAR_RELATIVE);
  if (!Array.isArray(calendar) || calendar.length === 0) {
    throw new BulgariaBiPreflightError("calendar", "Upcoming calendar must stay documentary and non-empty.", {
      lineage_id: LINEAGE_ID,
    });
  }
  for (const value of calendar) {
    const row = asRecord(value, "calendar");
    if (row.justin_approved !== false) {
      throw new BulgariaBiPreflightError("calendar", "Calendar rows must stay justin_approved false.", {
        lineage_id: LINEAGE_ID,
      });
    }
  }

  const gapsJson = readJson(RESEARCH_GAPS_RELATIVE);
  if (!Array.isArray(gapsJson)) {
    throw new BulgariaBiPreflightError("holds", "Research gaps must be an array.", { lineage_id: LINEAGE_ID });
  }
  const gaps: BulgariaBiGap[] = gapsJson.map((value, source_index) => {
    const row = asRecord(value, `gap ${source_index}`);
    return {
      hold_id: String(row.hold_id ?? ""),
      title: String(row.title ?? ""),
      finding: String(row.finding ?? ""),
      status: String(row.status ?? ""),
      justin_approved: row.justin_approved === true,
      source_index,
    };
  });
  if (gaps.length !== OPEN_HOLD_IDS.length || gaps.some((gap, index) => gap.hold_id !== OPEN_HOLD_IDS[index])) {
    throw new BulgariaBiPreflightError("holds", "Named holds must stay G01–G16 in order.", { lineage_id: LINEAGE_ID });
  }
  if (gaps.some((gap) => gap.justin_approved || gap.status !== "research_hold" || !gap.finding.trim())) {
    throw new BulgariaBiPreflightError("holds", "Named holds must stay open research holds.", { lineage_id: LINEAGE_ID });
  }

  const hashInputs = buildBiHashInputs({
    inputs: tracked.map(({ input_path, input_kind, sha256, byte_count }) => ({
      input_path,
      input_kind,
      sha256,
      byte_count,
    })),
  });
  const fingerprint = fingerprintSha256(hashInputs);
  return {
    root,
    tracked,
    byPath,
    fingerprint,
    releaseId: releaseIdFor(fingerprint),
    hashInputsJson: canonical(hashInputs),
    offices,
    tiers,
    gaps,
    preservedIds,
    intendedInventory: {
      lineage_id: LINEAGE_ID,
      adapter_version: BI_ADAPTER_VERSION,
      classifier: TIER_PATH,
      preserved_classifier: PROMPT_P_TIER_PATH,
      omitted_paths: [...OMITTED_PATHS],
      prompt_bi: true,
      publish_holds: false,
    },
  };
}

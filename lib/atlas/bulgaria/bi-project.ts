import type { BulgariaProjection, SqlRow } from "./project";
import type { BulgariaBiInventory } from "./bi-inventory";
import {
  BI_ADAPTER_VERSION,
  BI_DRAFT_OFFICE_IDS,
  BI_EXPECTED_COUNTS,
  BI_OFFICE_REGISTER_RELATIVE,
  BI_OFFICE_REGISTER_SHA256,
  BI_RESEARCH_GAPS_RELATIVE,
  BI_SCHEMA_TIER_SHA256,
  COUNTRY_CODE,
  COUNTRY_ID,
  GRADEC_OFFICE_ID,
  HELD_EXAMPLE_OFFICE_IDS,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_NAMESPACE,
  SCHEMA_VERSION,
  TIER_PATH,
  UPCOMING_CALENDAR_RELATIVE,
  canonical,
  geographyIdFor,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  unresolvedId,
} from "./identity";

const DRAFT_IDS = new Set<string>(BI_DRAFT_OFFICE_IDS);

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
  }
}

function schemaTier(raw: string, officeId: string): "national_context" | "municipal" | "other" {
  if (raw === "municipal") return "municipal";
  if (raw === "national") return "national_context";
  if (raw === "other") return "other";
  if (raw === "regional") throw new Error(`Bulgaria must not publish a regional tier for ${officeId}`);
  throw new Error(`Unsupported Bulgaria tier ${JSON.stringify(raw)} for ${officeId}`);
}

function blankLocator(): SqlRow {
  return {
    country_id: null,
    geography_id: null,
    id_namespace: null,
    office_id: null,
    history_key: null,
    proceeding_id: null,
    result_row_id: null,
    party_namespace: null,
    party_mapping_id: null,
    source_namespace: null,
    source_id: null,
    input_path: null,
  };
}

export function projectBulgariaPromptBi(inventory: BulgariaBiInventory): BulgariaProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;
  const tierById = new Map(inventory.tiers.map((row) => [row.office_id, row]));
  const published = inventory.offices.filter(
    (row) => row.scope_disposition === "inherited_P_accepted" || DRAFT_IDS.has(row.office_id),
  );
  if (published.length !== BI_EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${BI_EXPECTED_COUNTS.offices} published offices, found ${published.length}`);
  }
  const holdPublished = inventory.offices.filter((row) => row.scope_disposition === "hold_submunicipal_scope");
  if (holdPublished.length !== BI_EXPECTED_COUNTS.held_offices) {
    throw new Error(`Hold count ${holdPublished.length}`);
  }
  if (published.some((row) => row.scope_disposition === "hold_submunicipal_scope")) {
    throw new Error("A hold row entered the published office set");
  }
  for (const officeId of [...HELD_EXAMPLE_OFFICE_IDS, GRADEC_OFFICE_ID]) {
    if (published.some((row) => row.office_id === officeId)) {
      throw new Error(`Held office ${officeId} must not publish`);
    }
  }

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: null,
  }));

  const countryRec = recordKey("country", [COUNTRY_ID]);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Bulgaria",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: "2026-09-29",
    notes:
      "Prompt BI additive import. 530 Prompt P municipality-wide offices preserved. 4 national/EP/GNA drafts are needs_review. 3067 submunicipal holds stay unpublished. Slim land publishes 0 events, 0 results, and 0 sources.",
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: BI_SCHEMA_TIER_SHA256, json_pointer: "" }),
      row: { country_id: COUNTRY_ID, country_code: COUNTRY_CODE, name: "Bulgaria" },
      supplemental: {
        prompt: "BI",
        inherited_prompt: "P",
        open_holds: inventory.gaps.map((gap) => gap.hold_id),
        events_file_not_projected: "docs/phase1/bulgaria/data/BI_New_Events.json",
        results_file_not_projected: "docs/phase1/bulgaria/data/BI_New_Results.json",
        sources_file_not_projected: "docs/phase1/bulgaria/sources",
        upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
        published_events: 0,
        published_result_rows: 0,
        published_sources: 0,
        applied_calendar_rows: 0,
        justin_approved: false,
        applied: false,
        research_coverage_complete: false,
        successor_edges: 0,
        regional_offices: 0,
      },
    }),
  };

  const geographies: SqlRow[] = [];
  const offices: SqlRow[] = [];
  const tiers: SqlRow[] = [];
  const geoSeen = new Set<string>();
  let current = 0;
  let historical = 0;
  let municipal = 0;
  let national = 0;
  let other = 0;
  let approved = 0;
  let needsReview = 0;

  for (const register of published) {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Published office ${register.office_id} lost its tier`);
    rejectFixtures([register.office_id, register.jurisdiction, register.office, register.geography_id], "bulgaria office");
    if (tier.justin_approved !== false || tier.applied !== false) {
      throw new Error(`Office ${register.office_id} must stay justin_approved false and applied false`);
    }
    const isDraft = tier.production_disposition === "draft_pending_Justin";
    const isInherited = tier.production_disposition === "inherited_P_accepted";
    if (!isDraft && !isInherited) {
      throw new Error(`Office ${register.office_id} is not an inherited or draft row`);
    }
    if (isDraft && !DRAFT_IDS.has(register.office_id)) {
      throw new Error(`Unexpected draft office ${register.office_id}`);
    }
    const geographyId = isInherited ? register.geography_id : geographyIdFor(register.office_id);
    if (!geographyId) throw new Error(`Office ${register.office_id} has no geography`);
    if (geoSeen.has(geographyId)) throw new Error(`Duplicate geography ${geographyId}`);
    geoSeen.add(geographyId);
    const mapped = schemaTier(tier.tier, register.office_id);
    if (isInherited && mapped !== "municipal") {
      throw new Error(`Inherited ${register.office_id} must stay municipal`);
    }
    const officeStatus = register.lifecycle === "historical_only" ? "historical" : "current";
    if (isInherited && officeStatus !== "current") {
      throw new Error(`Inherited ${register.office_id} must stay current`);
    }
    if (register.office_id === "BG-GRAND-NATIONAL-ASSEMBLY-1990" && officeStatus !== "historical") {
      throw new Error("Grand National Assembly 1990 must stay historical");
    }
    const reviewStatus = isDraft ? "needs_review" : "approved";
    if (isDraft && (tier.human_review_required !== true || reviewStatus !== "needs_review")) {
      throw new Error(`Draft ${register.office_id} must publish as needs_review`);
    }
    geographies.push({
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: register.jurisdiction,
      parent_geography_id: null,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: BI_OFFICE_REGISTER_RELATIVE,
          sha256: BI_OFFICE_REGISTER_SHA256,
          json_pointer: `/${register.register_index}`,
        }),
        row: { office_id: register.office_id, geography_id: register.geography_id, jurisdiction: register.jurisdiction },
        supplemental: {
          geography_rule: isInherited ? "preserved_prompt_p_geography_id" : "key(geo,[bulgaria,exact_office_id])",
          source_geography_id: register.geography_id,
        },
      }),
    });
    offices.push({
      id_namespace: N,
      office_id: register.office_id,
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: `${register.jurisdiction} — ${register.office}`,
      office_type: register.office,
      office_status: officeStatus,
      record_state: "active",
      state_note: null,
      registry_qualified: null,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: BI_OFFICE_REGISTER_RELATIVE,
          sha256: BI_OFFICE_REGISTER_SHA256,
          json_pointer: `/${register.register_index}`,
        }),
        row: {
          office_id: register.office_id,
          jurisdiction: register.jurisdiction,
          office: register.office,
          scope_disposition: register.scope_disposition,
          new_BI_approval: false,
        },
        supplemental: {
          production_disposition: tier.production_disposition,
          justin_approved: false,
          applied: false,
          calendar_rows_applied: false,
          events_imported: false,
          results_imported: false,
          sources_imported: false,
        },
      }),
    });
    tiers.push({
      id_namespace: N,
      office_id: register.office_id,
      tier: mapped,
      review_status: reviewStatus,
      rationale: tier.rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: BI_SCHEMA_TIER_SHA256,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: TIER_PATH,
          sha256: BI_SCHEMA_TIER_SHA256,
          json_pointer: `/classifications/${tier.tier_index}`,
        }),
        row: {
          office_id: tier.office_id,
          tier: tier.tier,
          draft_tier: tier.draft_tier,
          production_disposition: tier.production_disposition,
          justin_approved: false,
          applied: false,
        },
        supplemental: {
          published_review_status: reviewStatus,
          justin_approved_remains_false: true,
          applied_remains_false: true,
          inherited_prompt_p_acceptance: isInherited,
        },
      }),
    });
    if (officeStatus === "current") current += 1;
    else historical += 1;
    if (mapped === "municipal") municipal += 1;
    else if (mapped === "national_context") national += 1;
    else other += 1;
    if (reviewStatus === "approved") approved += 1;
    else needsReview += 1;
  }

  if (
    current !== BI_EXPECTED_COUNTS.current_offices ||
    historical !== BI_EXPECTED_COUNTS.historical_offices ||
    municipal !== BI_EXPECTED_COUNTS.municipal_offices ||
    national !== BI_EXPECTED_COUNTS.national_offices ||
    other !== BI_EXPECTED_COUNTS.other_offices ||
    approved !== BI_EXPECTED_COUNTS.approved_classifications ||
    needsReview !== BI_EXPECTED_COUNTS.needs_review_classifications ||
    geographies.length !== BI_EXPECTED_COUNTS.geographies
  ) {
    throw new Error(
      `BI publication split current=${current} historical=${historical} municipal=${municipal} national=${national} other=${other} approved=${approved} needs_review=${needsReview} geos=${geographies.length}`,
    );
  }
  if (tiers.some((row) => row.tier === "regional")) {
    throw new Error("Regional elected offices must stay 0");
  }

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  function addLocator(row: SqlRow): void {
    const id = String(row.record_key);
    if (locatorSeen.has(id)) throw new Error(`Duplicate record_key ${id}`);
    locatorSeen.add(id);
    locators.push(row);
  }
  addLocator({
    record_key: countryRec,
    entity_kind: "country",
    ...blankLocator(),
    country_id: COUNTRY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: canonical({ derived_path: TIER_PATH, derived_json_pointer: "", source_row: null }),
  });
  for (const geography of geographies) {
    addLocator({
      record_key: recordKey("geography", [COUNTRY_ID, geography.geography_id]),
      entity_kind: "geography",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      geography_id: geography.geography_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical({
        derived_path: BI_OFFICE_REGISTER_RELATIVE,
        derived_json_pointer: null,
        source_row: null,
      }),
    });
  }
  for (const office of offices) {
    addLocator({
      record_key: recordKey("office", [N, office.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: office.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical({
        derived_path: BI_OFFICE_REGISTER_RELATIVE,
        derived_json_pointer: null,
        source_row: null,
      }),
    });
  }
  for (const item of inventory.tracked) {
    addLocator({
      record_key: recordKey("input", [L, item.input_path]),
      entity_kind: "input",
      ...blankLocator(),
      input_path: item.input_path,
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical({ derived_path: item.input_path, derived_json_pointer: null, source_row: null }),
    });
  }

  const unresolved: SqlRow[] = inventory.gaps.map((gap) => {
    const occurrence = { input_path: BI_RESEARCH_GAPS_RELATIVE, json_pointer: `/${gap.source_index}`, id: gap.hold_id };
    return {
      unresolved_id: unresolvedId(countryRec, [occurrence], gap.hold_id),
      record_key: countryRec,
      original_token: gap.hold_id,
      source_locator: canonical(occurrence),
      reason: gap.finding,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: BI_RESEARCH_GAPS_RELATIVE,
          sha256: inventory.byPath.get(BI_RESEARCH_GAPS_RELATIVE)?.sha256 ?? null,
          json_pointer: `/${gap.source_index}`,
        }),
        row: { hold_id: gap.hold_id, title: gap.title, status: gap.status, justin_approved: false, closed: false },
      }),
    };
  });
  if (unresolved.length !== BI_EXPECTED_COUNTS.named_open_holds) {
    throw new Error(`Named holds ${unresolved.length}`);
  }

  const crosswalks: SqlRow[] = [
    {
      entity_kind: "country",
      upstream_namespace: "observatory:bulgaria",
      upstream_id: "bulgaria",
      record_key: countryRec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: BI_SCHEMA_TIER_SHA256 }),
        row: { country_id: COUNTRY_ID },
      }),
    },
  ];
  for (const office of offices) {
    crosswalks.push({
      entity_kind: "office",
      upstream_namespace: "bulgaria:office-register",
      upstream_id: office.office_id,
      record_key: recordKey("office", [N, office.office_id]),
      reason: isDraftOffice(String(office.office_id)) ? "prompt_bi_draft_office" : "preserved_prompt_p_office_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: BI_OFFICE_REGISTER_RELATIVE, sha256: BI_OFFICE_REGISTER_SHA256 }),
        row: { office_id: office.office_id, justin_approved: false, applied: false },
      }),
    });
  }

  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: current,
    historical_offices: historical,
    inherited_offices: approved,
    draft_offices: needsReview,
    municipal_offices: municipal,
    national_offices: national,
    other_offices: other,
    regional_offices: 0,
    held_offices: holdPublished.length,
    approved_classifications: approved,
    needs_review_classifications: needsReview,
    geographies: geographies.length,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    result_rows: 0,
    sources: 0,
    named_open_holds: unresolved.length,
    upcoming_calendar_rows: inventory.upcomingCalendarRows,
    applied_calendar_rows: 0,
    successor_links: 0,
    retained_inputs: retainedInputs.length,
    mayor_offices: BI_EXPECTED_COUNTS.mayor_offices,
    municipal_council_offices: BI_EXPECTED_COUNTS.municipal_council_offices,
  };

  return {
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description:
        "Bulgaria Prompt BI additive import. Preserves 530 Prompt P offices, adds 4 needs_review drafts, and excludes 3067 holds.",
    },
    release: {
      lineage_id: L,
      release_id: R,
      fingerprint_sha256: inventory.fingerprint,
      hash_inputs_json: inventory.hashInputsJson,
      adapter_version: BI_ADAPTER_VERSION,
      method_version: METHOD_VERSION,
      schema_version: SCHEMA_VERSION,
      research_snapshot_label: "2026-09-29",
      upstream_release_id: L,
      validated_counts_json: canonical(validatedCounts),
      research_coverage_complete: 0,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: BI_SCHEMA_TIER_SHA256 }),
        row: { prompt: "BI", status: "draft" },
        supplemental: {
          published_events: 0,
          published_result_rows: 0,
          published_sources: 0,
          holds_excluded: holdPublished.length,
          drafts_needs_review: needsReview,
        },
      }),
    },
    publicationRelease: { lineage_id: L, release_id: R },
    retainedInputs,
    country,
    geographies,
    offices,
    tiers,
    dates: [],
    events: [],
    sources: [],
    results: [],
    locators,
    evidence: [],
    unresolved,
    crosswalks,
    validatedCounts,
  };
}

function isDraftOffice(officeId: string): boolean {
  return DRAFT_IDS.has(officeId);
}

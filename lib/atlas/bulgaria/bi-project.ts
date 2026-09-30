import type { BulgariaBiInventory, BulgariaBiRegisterRow, BulgariaBiTierRow } from "./bi-inventory";
import {
  BI_ADAPTER_VERSION,
  BI_SCHEMA_TIER_SHA256,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NOTES,
  EXPECTED_BI_COUNTS,
  GRADEC_OFFICE_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_NAMESPACE,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  TIER_PATH,
  UPCOMING_CALENDAR_RELATIVE,
  canonical,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  unresolvedId,
} from "./bi-identity";
import type { BulgariaProjection, SqlRow } from "./project";

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

function sourceRowLocator(derivedPath: string, derivedPointer?: string | null): string {
  return canonical({
    derived_json_pointer: derivedPointer ?? null,
    derived_path: derivedPath,
    source_row: null,
  });
}

function sqlOfficeStatus(office: BulgariaBiRegisterRow): "current" | "historical" {
  if (office.scope_disposition === "BI_draft_historical" || office.lifecycle === "historical_only") return "historical";
  if (office.scope_disposition === "inherited_P_accepted" || office.scope_disposition === "BI_draft_current") return "current";
  throw new Error(`Office ${office.office_id} is not publishable`);
}

export function projectBulgariaBi(inventory: BulgariaBiInventory): BulgariaProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;
  const tierById = new Map(inventory.tiers.map((row) => [row.office_id, row]));
  const preserved = new Set(inventory.preservedIds);

  const published = inventory.offices.filter((office) => office.scope_disposition !== "hold_submunicipal_scope");
  if (published.length !== EXPECTED_BI_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_BI_COUNTS.offices} published offices, found ${published.length}`);
  }
  if (published.some((office) => office.office_id === GRADEC_OFFICE_ID)) {
    throw new Error("Градец must stay unpublished");
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
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: BI_SCHEMA_TIER_SHA256, json_pointer: "" }),
      row: { country_id: COUNTRY_ID, country_code: COUNTRY_CODE, name: "Bulgaria" },
      supplemental: {
        prompt: "BI",
        production_approved: false,
        justin_approved: false,
        applied: false,
        research_coverage_complete: false,
        preserved_prompt_p_offices: EXPECTED_BI_COUNTS.preserved_offices,
        published_events: 0,
        published_result_rows: 0,
        published_sources: 0,
        held_offices_unpublished: EXPECTED_BI_COUNTS.held_offices,
        regional_elected_offices: 0,
        successor_edges: 0,
        applied_calendar_rows: 0,
        upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
        omitted_event_results: true,
      },
    }),
  };

  const geoIds = new Map<string, { name: string; officeIds: string[]; sourceIndex: number | null; schemaContainer: boolean }>();
  for (const office of published) {
    const geographyId = office.geography_id ?? COUNTRY_GEOGRAPHY_ID;
    const existing = geoIds.get(geographyId);
    if (existing) {
      existing.officeIds.push(office.office_id);
      continue;
    }
    geoIds.set(geographyId, {
      name: office.jurisdiction,
      officeIds: [office.office_id],
      sourceIndex: office.geography_id ? office.register_index : null,
      schemaContainer: office.geography_id == null,
    });
  }
  if (geoIds.size !== EXPECTED_BI_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_BI_COUNTS.geographies} geographies, found ${geoIds.size}`);
  }

  const geographies: SqlRow[] = [...geoIds.entries()].map(([geographyId, geography]) => ({
    country_id: COUNTRY_ID,
    geography_id: geographyId,
    name: geography.name,
    parent_geography_id: null,
    effective_from_label: null,
    effective_to_label: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: OFFICE_REGISTER_RELATIVE,
        sha256: OFFICE_REGISTER_SHA256,
        json_pointer: geography.sourceIndex == null ? "" : `/${geography.sourceIndex}`,
      }),
      row: { geography_id: geographyId, name: geography.name, office_ids: geography.officeIds },
      supplemental: {
        schema_container: geography.schemaContainer,
        source_geography_id_null: geography.schemaContainer,
      },
    }),
  }));

  const offices: SqlRow[] = [];
  const tiers: SqlRow[] = [];
  let mayors = 0;
  let councils = 0;
  let current = 0;
  let historical = 0;
  for (const office of published) {
    const tier = tierById.get(office.office_id);
    if (!tier) throw new Error(`Office ${office.office_id} lost its tier`);
    const inherited = office.scope_disposition === "inherited_P_accepted";
    if (inherited !== preserved.has(office.office_id)) {
      throw new Error(`Office ${office.office_id} preservation flag drifted`);
    }
    const reviewStatus = inherited ? "approved" : "needs_review";
    if (!inherited && tier.production_disposition !== "draft_pending_Justin") {
      throw new Error(`Draft office ${office.office_id} must stay draft_pending_Justin`);
    }
    const mapped = schemaInterchangeTier(tier.tier);
    if (inherited && mapped !== "municipal") throw new Error(`Preserved office ${office.office_id} must stay municipal`);
    if (office.office === "Mayor") mayors += 1;
    if (office.office === "Municipal council") councils += 1;
    const officeStatus = sqlOfficeStatus(office);
    if (officeStatus === "current") current += 1;
    else historical += 1;
    const geographyId = office.geography_id ?? COUNTRY_GEOGRAPHY_ID;
    offices.push({
      id_namespace: N,
      office_id: office.office_id,
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: `${office.jurisdiction} — ${office.office}`,
      office_type: office.office,
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
          input_path: OFFICE_REGISTER_RELATIVE,
          sha256: OFFICE_REGISTER_SHA256,
          json_pointer: `/${office.register_index}`,
        }),
        row: {
          office_id: office.office_id,
          jurisdiction: office.jurisdiction,
          office: office.office,
          family: office.family,
          lifecycle: office.lifecycle,
          scope_disposition: office.scope_disposition,
          selection_mode: office.selection_mode,
          seats: office.seats,
          geography_id: office.geography_id,
          new_BI_approval: false,
        },
        supplemental: {
          preserved_prompt_p_id: inherited,
          justin_approved: false,
          applied: false,
          calendar_rows_applied: false,
          production_approved: inherited,
        },
      }),
    });
    tiers.push(tierRow(office, tier, reviewStatus, mapped, L, R, N));
  }

  if (mayors !== EXPECTED_BI_COUNTS.mayor_offices || councils !== EXPECTED_BI_COUNTS.municipal_council_offices) {
    throw new Error(`Mayor/council counts ${mayors}/${councils}`);
  }
  if (current !== EXPECTED_BI_COUNTS.current_offices || historical !== EXPECTED_BI_COUNTS.historical_offices) {
    throw new Error(`Current/historical counts ${current}/${historical}`);
  }

  const locators: SqlRow[] = [];
  const seen = new Set<string>();
  const addLocator = (row: SqlRow) => {
    const id = String(row.record_key);
    if (seen.has(id)) throw new Error(`Duplicate record_key ${id}`);
    seen.add(id);
    locators.push(row);
  };
  addLocator({
    record_key: countryRec,
    entity_kind: "country",
    ...blankLocator(),
    country_id: COUNTRY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator(TIER_PATH, ""),
  });
  for (const office of published) {
    addLocator({
      record_key: recordKey("office", [N, office.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: office.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(OFFICE_REGISTER_RELATIVE, `/${office.register_index}`),
    });
  }
  for (const item of inventory.tracked) {
    addLocator({
      record_key: recordKey("input", [L, R, item.input_path]),
      entity_kind: "input",
      ...blankLocator(),
      input_path: item.input_path,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(item.input_path),
    });
  }

  const unresolved: SqlRow[] = inventory.gaps.map((gap) => {
    const occurrence = { input_path: RESEARCH_GAPS_RELATIVE, json_pointer: `/${gap.source_index}`, id: gap.hold_id };
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
          input_path: RESEARCH_GAPS_RELATIVE,
          sha256: inventory.byPath.get(RESEARCH_GAPS_RELATIVE)?.sha256 ?? null,
          json_pointer: `/${gap.source_index}`,
        }),
        row: { hold_id: gap.hold_id, title: gap.title, status: gap.status, justin_approved: false },
        supplemental: { hold_open: true },
      }),
    };
  });

  const municipal = tiers.filter((row) => row.tier === "municipal").length;
  const national = tiers.filter((row) => row.tier === "national_context").length;
  const other = tiers.filter((row) => row.tier === "other").length;
  const regional = tiers.filter((row) => row.tier === "regional").length;
  const needsReview = tiers.filter((row) => row.review_status === "needs_review").length;
  const approved = tiers.filter((row) => row.review_status === "approved").length;
  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: current,
    historical_offices: historical,
    municipal_offices: municipal,
    national_offices: national,
    other_offices: other,
    regional_offices: regional,
    ep_offices: published.filter((office) => office.office_id === "BG-EUROPEAN-PARLIAMENT").length,
    needs_review_classifications: needsReview,
    approved_classifications: approved,
    held_offices: EXPECTED_BI_COUNTS.held_offices,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    result_rows: 0,
    sources: 0,
    research_dates: 0,
    applied_calendar_rows: 0,
    successor_edges: 0,
    named_open_holds: unresolved.length,
    geographies: geographies.length,
    mayor_offices: mayors,
    municipal_council_offices: councils,
    prompt_bi: 1,
    bi_draft_offices: needsReview,
  };
  if (
    validatedCounts.offices !== EXPECTED_BI_COUNTS.offices ||
    validatedCounts.needs_review_classifications !== EXPECTED_BI_COUNTS.needs_review_classifications ||
    validatedCounts.approved_classifications !== EXPECTED_BI_COUNTS.approved_classifications ||
    validatedCounts.regional_offices !== 0 ||
    validatedCounts.total_events !== 0 ||
    validatedCounts.result_rows !== 0 ||
    validatedCounts.sources !== 0
  ) {
    throw new Error("Bulgaria BI projection drifted from the additive slim contract");
  }

  return {
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description: "Bulgaria frozen country package",
    },
    release: {
      lineage_id: L,
      release_id: R,
      fingerprint_sha256: inventory.fingerprint,
      hash_inputs_json: inventory.hashInputsJson,
      adapter_version: BI_ADAPTER_VERSION,
      method_version: METHOD_VERSION,
      schema_version: SCHEMA_VERSION,
      research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
      upstream_release_id: L,
      validated_counts_json: canonical(validatedCounts),
      research_coverage_complete: 0,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: BI_SCHEMA_TIER_SHA256 }),
        row: { prompt: "BI", prompt_bi: true },
        supplemental: { publish_holds: false, slim_land: true },
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
    crosswalks: [],
    validatedCounts,
  };
}

function tierRow(
  office: BulgariaBiRegisterRow,
  tier: BulgariaBiTierRow,
  reviewStatus: "approved" | "needs_review",
  mapped: string,
  lineageId: string,
  releaseId: string,
  namespace: string,
): SqlRow {
  return {
    id_namespace: namespace,
    office_id: office.office_id,
    tier: mapped,
    review_status: reviewStatus,
    rationale: tier.rationale,
    lineage_id: lineageId,
    release_id: releaseId,
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
        new_BI_approval: false,
      },
      supplemental: {
        published_review_status: reviewStatus,
        schema_interchange_tier: mapped,
        bi_file_justin_approved: false,
      },
    }),
  };
}

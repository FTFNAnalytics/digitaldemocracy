import {
  ADAPTER_VERSION,
  AUDIT_RELATIVE,
  BELLINZONA_EXECUTIVE_ID,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  COUNTRY_RECORD_KEY,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GEOGRAPHY_RELATIVE,
  HISTORICAL_HORGEN_ID,
  HISTORICAL_HORGEN_RECORD_KEY,
  LINEAGE_ID,
  METHOD_VERSION,
  NATIONAL_COUNCIL_ID,
  NATIONAL_COUNCIL_RECORD_KEY,
  OFFICE_NAMESPACE,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UNRESOLVED_RELATIVE,
  canonical,
  dateId,
  hostnameOf,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  switzerlandEvidenceId,
  switzerlandUnresolvedId,
  type Locator,
} from "./identity";
import type {
  SwitzerlandEvidenceRef,
  SwitzerlandInventory,
  SwitzerlandResultRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type SwitzerlandProjection = {
  lineage: SqlRow;
  release: SqlRow;
  publicationRelease: SqlRow;
  retainedInputs: SqlRow[];
  country: SqlRow;
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
};

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function pointerFor(index: number): string {
  return `/${index}`;
}

function originFor(relativePath: string, sha256: string, index: number, field?: string): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: field ? `/${index}/${field}` : pointerFor(index),
  });
}

function sliceHash(inventory: SwitzerlandInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: {
  inputPath: string;
  sha256: string;
  locatorText?: string | null;
  derivedPath?: string;
  derivedPointer?: string;
}): string {
  return canonical({
    derived_path: args.derivedPath ?? null,
    derived_pointer: args.derivedPointer ?? null,
    input_path: args.inputPath,
    locator: args.locatorText ?? null,
    sha256: args.sha256,
  });
}

function mapTier(classification: { tier: string; schema_v1_tier?: string }): string | null {
  const raw = classification.schema_v1_tier ?? classification.tier;
  if (raw === "municipal" || raw === "regional" || raw === "other" || raw === "national_context") return raw;
  if (raw === "national") return "national_context";
  if (raw === "unknown") return null;
  throw new Error(`Unsupported Switzerland classification tier ${JSON.stringify(raw)}`);
}

function locatorText(ref: SwitzerlandEvidenceRef): unknown {
  return ref.locator ?? ref.json_pointer ?? ref.input_path;
}

function basename(inputPath: string): string {
  return inputPath.split("/").pop() ?? inputPath;
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = String(row.record_key);
  if (seen.has(key)) throw new Error(`Duplicate record_key ${key}`);
  seen.add(key);
  locators.push(row);
}

function addCrosswalk(crosswalks: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
  if (seen.has(key)) return;
  seen.add(key);
  crosswalks.push(row);
}

function emptyLocatorShape(extra: SqlRow): SqlRow {
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
    ...extra,
  };
}

function evidenceStatusFor(row: SwitzerlandResultRow): string {
  const status = row.evidence_status ?? "recorded";
  const allowed = new Set([
    "recorded",
    "zero",
    "unknown",
    "not_applicable",
    "structurally_unavailable",
    "preliminary",
    "disputed",
    "superseded",
  ]);
  if (!allowed.has(status)) throw new Error(`Unsupported evidence_status ${status} on ${row.result_row_id}`);
  return status;
}

export function projectSwitzerland(inventory: SwitzerlandInventory): SwitzerlandProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;

  rejectFixtures(
    inventory.offices.map((row) => row.office_id),
    "office register",
  );
  rejectFixtures(
    inventory.events.map((row) => row.event_id),
    "events",
  );
  rejectFixtures(
    inventory.results.map((row) => row.result_row_id),
    "results",
  );
  rejectFixtures(
    inventory.proceedings.map((row) => row.proceeding_id),
    "proceedings",
  );
  for (const item of inventory.tracked) {
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Switzerland offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Switzerland events, found ${inventory.events.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Switzerland results, found ${inventory.results.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Switzerland geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Switzerland proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Switzerland classifications`);
  }

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: item.input_path.endsWith(".json") ? item.text : null,
  }));

  const registerHash = sliceHash(inventory, REGISTER_RELATIVE);
  const countryRec = recordKey("country", [COUNTRY_ID]);
  if (countryRec !== COUNTRY_RECORD_KEY) {
    throw new Error(`Switzerland country record_key drifted: ${countryRec}`);
  }
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Switzerland",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: REGISTER_RELATIVE,
        sha256: registerHash,
        json_pointer: "/0",
      }),
      row: {
        country_id: COUNTRY_ID,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
        geography_snapshot: "2026-01-01",
      },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: [
          "commune_executive_gaps_308_vd284_sz24",
          "thin_historic_merger_archive_586_geographies_11_offices",
          "citizen_assembly_parliament_caveat_1938",
          "mode_variance_disputed_result_rows",
          "full_register_certification_open",
        ],
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Set<string>();
  const pushDate = (row: SqlRow) => {
    if (dateIds.has(String(row.date_id))) return;
    dateIds.add(String(row.date_id));
    dates.push(row);
  };

  const geoById = new Map<string, string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Switzerland`);
    geoById.set(row.geography_id, row.geography_id);
    const origin = originFor(GEOGRAPHY_RELATIVE, sliceHash(inventory, GEOGRAPHY_RELATIVE), index);
    return {
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      parent_geography_id: row.parent_geography_id ?? null,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    };
  });

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeIds = new Set<string>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let nextDates = 0;
  let currentCommunalExecutives = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Switzerland`);
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing an accepted classification`);
    }
    officeIds.add(row.office_id);
    const historical = row.current === false;
    if (historical) historicalOffices += 1;
    else currentOffices += 1;
    if (row.current && row.office_type === "communal_executive") currentCommunalExecutives += 1;
    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    if (row.next_election) {
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      nextDates += 1;
      const origin = originFor(REGISTER_RELATIVE, registerHash, i, "next_election");
      pushDate({
        date_id: nextDateId,
        label: row.next_election.label,
        precision: row.next_election.precision === "month" ? "month" : "year",
        certainty: "expected",
        year: row.next_election.year ?? null,
        month: row.next_election.month ?? null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin, row: row.next_election }),
      });
    }
    const origin = originFor(REGISTER_RELATIVE, registerHash, i);
    const rec = recordKey("office", [N, row.office_id]);
    if (row.office_id === NATIONAL_COUNCIL_ID && rec !== NATIONAL_COUNCIL_RECORD_KEY) {
      throw new Error(`National Council record_key drifted: ${rec}`);
    }
    if (row.office_id === HISTORICAL_HORGEN_ID && rec !== HISTORICAL_HORGEN_RECORD_KEY) {
      throw new Error(`Horgen historical record_key drifted: ${rec}`);
    }
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      office_type: row.office_type,
      office_status: historical ? "historical" : "current",
      record_state: "active",
      state_note: canonical({
        review_notes: row.review_notes ?? [],
        electoral_mode: row.electoral_mode ?? null,
        raw: row.raw ?? null,
      }),
      registry_qualified: null,
      next_date_id: nextDateId,
      next_date_resolution: nextDateResolution,
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Classification ${row.office_id} is not in the accepted register`);
    }
    const mapped = mapTier(row);
    const origin = originFor(TIER_PATH, TIER_SHA256, index);
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapped,
      review_status: mapped == null ? "unknown" : "approved",
      rationale: row.rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: TIER_SHA256,
      raw_json: rawEnvelope({ origin, row }),
    };
  });

  const events: SqlRow[] = [];
  const eventByHk = new Map<string, (typeof inventory.events)[number]>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let eventDates = 0;
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    eventByHk.set(row.history_key, row);
    let dateIdValue: string | null = null;
    if (row.date) {
      const year = Number(String(row.date).slice(0, 4));
      if (!Number.isInteger(year) || year < 1) {
        throw new Error(`Event ${row.history_key} has an unusable year label ${JSON.stringify(row.date)}`);
      }
      dateIdValue = dateId("election_event", row.event_id, "ballot");
      eventDates += 1;
      pushDate({
        date_id: dateIdValue,
        label: row.date,
        precision: row.precision === "month" ? "month" : "year",
        certainty: row.certainty === "expected" ? "expected" : "called",
        year,
        month: row.precision === "month" ? Number(String(row.date).slice(5, 7)) || null : null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor(EVENTS_RELATIVE, eventsHash, i, "date"),
          row: { date: row.date, precision: row.precision, certainty: row.certainty },
        }),
      });
    }
    const role = row.selected_history_role ?? "selected";
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else throw new Error(`Switzerland must not author prospective events; got ${role} for ${row.history_key}`);

    const kind = row.event_kind ?? "unknown";
    if (kind !== "ordinary" && kind !== "unknown") {
      throw new Error(`Unsupported Switzerland event_kind ${JSON.stringify(kind)} for ${row.history_key}`);
    }

    const origin = originFor(EVENTS_RELATIVE, eventsHash, i);
    const nationalAggregate = row.history_key.endsWith("::CH") && row.office_id === NATIONAL_COUNCIL_ID;
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: row.date_resolution ?? "resolved",
      event_kind: kind,
      selected_history_role: role,
      electoral_system: null,
      comparability: null,
      ballot_basis: row.ballot_basis ?? "unknown",
      share_unit: row.share_unit ?? "percent_0_100",
      legal_outcome: row.legal_outcome ?? "unknown",
      record_state: "active",
      state_note: nationalAggregate
        ? "CH national aggregate is not additive to 26 constituent vectors."
        : row.raw
          ? canonical(row.raw)
          : null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const proceedings: SqlRow[] = [];
  const proceedingIds = new Set<string>();
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    }
    if (row.kind !== "first_round" && row.kind !== "runoff") {
      throw new Error(`Unsupported Switzerland proceeding kind ${JSON.stringify(row.kind)}`);
    }
    proceedingIds.add(row.proceeding_id);
    const origin = originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i);
    proceedings.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      kind: row.kind,
      sequence_no: row.sequence_no,
      supersedes_id: null,
      legal_outcome: row.legal_outcome ?? "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceByPath = new Map<string, string>();
  const sourceById = new Set<string>();
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  for (let i = 0; i < inventory.sources.length; i++) {
    const row = inventory.sources[i]!;
    const sourceId = String(row.source_id);
    const inputPath = String(row.input_path);
    sourceByPath.set(inputPath, sourceId);
    if (sourceById.has(sourceId)) continue;
    sourceById.add(sourceId);
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: sourceId,
      publisher: row.publisher ?? hostnameOf(row.url),
      title: basename(inputPath),
      url: row.url ?? null,
      checked_as_of_label: row.checked_as_of_label ?? RESEARCH_SNAPSHOT_LABEL,
      evidence_grade: null,
      file_sha256: row.sha256 ?? null,
      locator: inputPath,
      data_rights: row.data_rights ?? "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const results: SqlRow[] = [];
  const resultsHash = sliceHash(inventory, RESULTS_RELATIVE);
  let disputedResults = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    }
    if (row.proceeding_id && !proceedingIds.has(row.proceeding_id)) {
      throw new Error(`Result ${row.result_row_id} proceeding ${row.proceeding_id} is not authored`);
    }
    const status = evidenceStatusFor(row);
    if (status === "disputed") disputedResults += 1;
    const origin = originFor(RESULTS_RELATIVE, resultsHash, i);
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: row.proceeding_id ?? null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.candidate_or_list_label ?? null,
      original_party_label: row.original_party_label ?? null,
      original_party_code: row.original_party_code ?? null,
      party_namespace: null,
      party_mapping_id: null,
      votes: row.votes ?? null,
      votes_status: row.votes_status,
      share: row.share ?? null,
      share_status: row.share_status,
      share_unit: row.share_unit ?? "percent_0_100",
      seats: row.seats ?? null,
      seats_status: row.seats_status,
      elected_flag: null,
      is_substitute: null,
      evidence_status: status,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  addLocator(
    locators,
    locatorSeen,
    emptyLocatorShape({
      record_key: countryRec,
      entity_kind: "country",
      country_id: COUNTRY_ID,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: REGISTER_RELATIVE,
        sha256: registerHash,
        derivedPointer: "/0",
      }),
    }),
  );
  for (const [index, row] of inventory.geographies.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocatorShape({
        record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
        entity_kind: "geography",
        country_id: COUNTRY_ID,
        geography_id: row.geography_id,
        lineage_id: L,
        release_id: R,
        source_row_locator: sourceRowLocator({
          inputPath: GEOGRAPHY_RELATIVE,
          sha256: sliceHash(inventory, GEOGRAPHY_RELATIVE),
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  for (const [index, row] of inventory.offices.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocatorShape({
        record_key: recordKey("office", [N, row.office_id]),
        entity_kind: "office",
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        lineage_id: L,
        release_id: R,
        source_row_locator: sourceRowLocator({
          inputPath: REGISTER_RELATIVE,
          sha256: registerHash,
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  for (const [index, row] of inventory.events.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocatorShape({
        record_key: recordKey("event", [N, row.office_id, row.history_key]),
        entity_kind: "event",
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        history_key: row.history_key,
        lineage_id: L,
        release_id: R,
        source_row_locator: sourceRowLocator({
          inputPath: EVENTS_RELATIVE,
          sha256: eventsHash,
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  for (const [index, row] of inventory.proceedings.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocatorShape({
        record_key: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
        entity_kind: "proceeding",
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        history_key: row.history_key,
        proceeding_id: row.proceeding_id,
        lineage_id: L,
        release_id: R,
        source_row_locator: sourceRowLocator({
          inputPath: PROCEEDINGS_RELATIVE,
          sha256: proceedingsHash,
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  for (const [index, row] of inventory.results.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocatorShape({
        record_key: recordKey("result_row", [N, row.result_row_id]),
        entity_kind: "result_row",
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        history_key: row.history_key,
        result_row_id: row.result_row_id,
        lineage_id: L,
        release_id: R,
        source_row_locator: sourceRowLocator({
          inputPath: RESULTS_RELATIVE,
          sha256: resultsHash,
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  for (const row of sources) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocatorShape({
        record_key: recordKey("source", [COUNTRY_ID, L, row.source_id]),
        entity_kind: "source",
        country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: row.source_id,
        lineage_id: L,
        release_id: R,
        source_row_locator: sourceRowLocator({
          inputPath: SOURCES_RELATIVE,
          sha256: sourcesHash,
          locatorText: String(row.locator),
        }),
      }),
    );
  }
  for (const item of inventory.tracked) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocatorShape({
        record_key: recordKey("input", [L, item.input_path]),
        entity_kind: "input",
        input_path: item.input_path,
        lineage_id: L,
        release_id: R,
        source_row_locator: sourceRowLocator({
          inputPath: item.input_path,
          sha256: item.sha256,
        }),
      }),
    );
  }

  const evidence: SqlRow[] = [];
  const evidenceSeen = new Set<string>();
  const pushEvidence = (args: {
    recordKey: string;
    refs: SwitzerlandEvidenceRef[] | undefined;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }) => {
    for (const ref of args.refs ?? []) {
      const sourceId = sourceByPath.get(ref.input_path);
      if (!sourceId) {
        throw new Error(`Broken evidence source FK for ${ref.input_path} on ${args.recordKey}`);
      }
      const loc = locatorText(ref);
      const evidenceId = switzerlandEvidenceId(args.recordKey, sourceId, ref.input_path, loc, args.claimKind);
      if (evidenceSeen.has(evidenceId)) continue;
      evidenceSeen.add(evidenceId);
      evidence.push({
        evidence_id: evidenceId,
        record_key: args.recordKey,
        source_country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: sourceId,
        source_locator: typeof loc === "string" ? loc : canonical(loc),
        claim_kind: args.claimKind,
        date_claim_id: args.dateClaimId ?? null,
        claim_json: canonical(args.claim),
        lineage_id: L,
        release_id: R,
      });
    }
  };

  for (const [index, row] of inventory.geographies.entries()) {
    pushEvidence({
      recordKey: recordKey("geography", [COUNTRY_ID, row.geography_id]),
      refs: row.evidence,
      claimKind: "institutional_scope",
      claim: { geography_id: row.geography_id, index },
    });
  }
  for (const row of inventory.offices) {
    const rec = recordKey("office", [N, row.office_id]);
    pushEvidence({
      recordKey: rec,
      refs: row.evidence,
      claimKind: "register_identity",
      claim: { office_id: row.office_id },
    });
    if (row.next_election?.evidence) {
      pushEvidence({
        recordKey: rec,
        refs: row.next_election.evidence,
        claimKind: "next_cycle_metadata",
        dateClaimId: dateId("office", row.office_id, "next"),
        claim: row.next_election,
      });
    }
  }
  for (const event of events) {
    const source = eventByHk.get(String(event.history_key))!;
    pushEvidence({
      recordKey: recordKey("event", [N, event.office_id, event.history_key]),
      refs: source.evidence,
      claimKind: "ballot_date",
      dateClaimId: event.date_id ? String(event.date_id) : null,
      claim: { history_key: event.history_key, date: source.date ?? null },
    });
  }
  for (const [index, row] of inventory.proceedings.entries()) {
    pushEvidence({
      recordKey: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
      refs: row.evidence,
      claimKind: "result_vector",
      claim: { proceeding_id: row.proceeding_id, index },
    });
  }
  for (const [index, row] of inventory.results.entries()) {
    pushEvidence({
      recordKey: recordKey("result_row", [N, row.result_row_id]),
      refs: row.evidence,
      claimKind: "result_vector",
      claim: { result_row_id: row.result_row_id, index },
    });
  }

  const unresolved: SqlRow[] = [];
  const unresolvedHash = sliceHash(inventory, UNRESOLVED_RELATIVE);
  const locatorKeys = new Set(locators.map((row) => String(row.record_key)));
  for (let i = 0; i < inventory.unresolved.length; i++) {
    const row = inventory.unresolved[i]!;
    if (!locatorKeys.has(row.record_key)) {
      throw new Error(`Unresolved evidence ${row.original_token} targets missing locator ${row.record_key}`);
    }
    const origin = originFor(UNRESOLVED_RELATIVE, unresolvedHash, i);
    unresolved.push({
      unresolved_id: switzerlandUnresolvedId(row.record_key, row.source_locator, row.original_token),
      record_key: row.record_key,
      original_token: row.original_token,
      source_locator: row.source_locator,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
    pushEvidence({
      recordKey: row.record_key,
      refs: row.evidence,
      claimKind: "review_gap",
      claim: { original_token: row.original_token, source_locator: row.source_locator },
    });
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  for (const row of inventory.geographies) {
    if (row.geography_id === "CH") {
      addCrosswalk(crosswalks, crosswalkSeen, {
        entity_kind: "geography",
        upstream_namespace: "BFS/CH",
        upstream_id: "CH",
        record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
        reason: "Source-backed deterministic country geography identity.",
        lineage_id: L,
        release_id: R,
        raw_json: canonical({ geography_id: row.geography_id, geography_type: row.geography_type }),
      });
      continue;
    }
    const canton = /^CH-([A-Z]{2})$/.exec(row.geography_id);
    if (canton) {
      addCrosswalk(crosswalks, crosswalkSeen, {
        entity_kind: "geography",
        upstream_namespace: "BFS/CH/canton",
        upstream_id: canton[1],
        record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
        reason: "Source-backed deterministic canton identity; preserve old code offices and same-code boundary claims.",
        lineage_id: L,
        release_id: R,
        raw_json: canonical({ geography_id: row.geography_id, geography_type: row.geography_type }),
      });
      continue;
    }
    const commune = /^CH-GM(\d+)$/.exec(row.geography_id);
    if (commune) {
      addCrosswalk(crosswalks, crosswalkSeen, {
        entity_kind: "geography",
        upstream_namespace: "BFS/CH/political-commune",
        upstream_id: commune[1],
        record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
        reason: "Source-backed deterministic commune identity from official BFS code. No name-only predecessor merge.",
        lineage_id: L,
        release_id: R,
        raw_json: canonical({ geography_id: row.geography_id, geography_type: row.geography_type }),
      });
    }
  }

  const executiveGaps = inventory.audit.filter((row) => row.executive_body_recorded === false);
  const vdGaps = executiveGaps.filter((row) => row.canton === "VD").length;
  const szGaps = executiveGaps.filter((row) => row.canton === "SZ").length;
  const parliamentCaveats = inventory.audit.filter((row) => row.representative_legislature_recorded === false).length;
  const historicalGeographies = inventory.geographies.filter((row) => row.current === false).length;
  if (executiveGaps.some((row) => (row.current_office_ids ?? []).some((id) => officeIds.has(id) && id.endsWith("-E") && inventory.offices.find((office) => office.office_id === id)?.current))) {
    throw new Error("Audit listed an executive gap that already has a current executive office");
  }
  for (const gap of executiveGaps) {
    const invented = `${gap.geography_id}-E`;
    const office = inventory.offices.find((row) => row.office_id === invented && row.current);
    if (office) {
      throw new Error(`Do not invent held commune executive ${invented}`);
    }
  }

  const municipal = tiers.filter((row) => row.tier === "municipal").length;
  const regional = tiers.filter((row) => row.tier === "regional").length;
  const national = tiers.filter((row) => row.tier === "national_context").length;
  const other = tiers.filter((row) => row.tier === "other").length;
  const validatedCounts = {
    current_offices: currentOffices,
    historical_offices: historicalOffices,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: selectedHistories,
    other_histories: otherHistories,
    prospective_events: 0,
    total_events: events.length,
    result_rows: results.length,
    disputed_result_rows: disputedResults,
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    focused_review_flags: inventory.tiers.classifications.filter((row) => row.human_review_required).length,
    sources: sources.length,
    proceedings: proceedings.length,
    party_mappings: 0,
    unresolved_evidence: unresolved.length,
    held_commune_executive_gaps: executiveGaps.length,
    held_commune_executive_gaps_vd: vdGaps,
    held_commune_executive_gaps_sz: szGaps,
    held_historical_geographies: historicalGeographies,
    held_parliament_caveats: parliamentCaveats,
    current_communal_executives: currentCommunalExecutives,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_year_called: eventDates,
    next_dates_month_expected: nextDates,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Switzerland ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }
  if (inventory.conflicts.length !== EXPECTED_COUNTS.disputed_result_rows) {
    throw new Error(`Conflicting-claims file ${inventory.conflicts.length} != ${EXPECTED_COUNTS.disputed_result_rows}`);
  }
  if (!offices.some((row) => row.office_id === BELLINZONA_EXECUTIVE_ID && row.next_date_id)) {
    throw new Error("Bellinzona expected April 2028 next-date metadata is missing");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Switzerland new sourced research: evidenced current bodies, historic observations and explicit incomplete-universe audit. Prompt U accepted 2,805 current + 11 historical offices with holds.",
  };
  const release = {
    lineage_id: L,
    release_id: R,
    fingerprint_sha256: inventory.fingerprint,
    hash_inputs_json: inventory.hashInputsJson,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
    upstream_release_id: null,
    validated_counts_json: canonical(validatedCounts),
    research_coverage_complete: 0,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256 }),
      row: { fingerprint: inventory.fingerprint, release_id: R },
    }),
  };

  return {
    lineage,
    release,
    publicationRelease: { lineage_id: L, release_id: R },
    retainedInputs,
    country,
    geographies,
    offices,
    tiers,
    dates,
    events,
    proceedings,
    sources,
    results,
    locators,
    evidence,
    unresolved,
    crosswalks,
    validatedCounts,
  };
}

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import type {
  BallotBasis,
  DatasetRelease,
  EvidenceSource,
  GovernmentTier,
  MetricReviewStatus,
  NormalizedDataset,
  NumericValue,
  OfficeRecord,
  PolityKind,
} from "../../../schemas/v1/normalized";
import { competitionIndex } from "../../observatory/metrics";
import {
  dateValue,
  emptyDataset,
  eventKind,
  issueCategory,
  key,
  legalOutcome,
  numberValue,
  slug,
  text,
  urlsOnly,
  type Raw,
} from "../../../scripts/import/normalize";
import type { CountryPackageInventory } from "./inventory";
import {
  cellText,
  cellYear,
  historyKey,
  loadWorkbookTables,
  verifyManifestFiles,
  type TableRow,
} from "./tables";

const COUNTRY_METHOD = "country-package-adapter-v1";

export function packageRelease(inventory: CountryPackageInventory): DatasetRelease {
  return {
    id: `country-package-${inventory.slug}`,
    schemaVersion: "1.1.0",
    methodVersion: COUNTRY_METHOD,
    provenance: {
      kind: "country_package",
      packageName: inventory.slug,
      notes: `Standalone research package under data/countries/${inventory.slug}. Coverage is partial; the adapter does not invent elections.`,
    },
    window: {
      startLabel: "2026-09-08",
      endLabel: "2028-03-08",
      inclusive: true,
      source: "imported_release",
    },
    snapshotLabel: null,
    retrievalRangeLabel: null,
    validatedCounts: {
      currentOffices: 0,
      historicalOffices: 0,
      histories: 0,
      resultRows: 0,
      briefings: 0,
      recomputedFromNormalizedRecords: true,
    },
    researchCoverageComplete: false,
    artifactRefs: [],
  };
}

export function regionIdFor(region: string): string {
  const s = region.trim().toLowerCase();
  if (s === "europe") return "europe";
  if (s === "oceania" || s === "new zealand") return "oceania";
  if (s === "australia") return "australia";
  if (s === "japan") return "japan";
  return slug(region);
}

export function polityKind(country: string, code?: string): PolityKind {
  if (/alderney/i.test(country) || code === "GG-ALD") return "territory";
  return "sovereign_country";
}

export function officeTier(office: string, calendarTier?: string): GovernmentTier {
  const blob = `${office} ${calendarTier ?? ""}`.toLowerCase();
  if (/regional/.test(blob) && !/municipal/.test(blob)) return "regional";
  if (/mayor|communal council|municipal/.test(blob)) return "municipal";
  if (/community board|councillor|council/.test(blob)) return "council";
  if (/national/.test(blob)) return "national_context";
  return "other";
}

export function ballotBasisOf(value: unknown): BallotBasis {
  const s = text(value).toLowerCase();
  if (/mark|multi.?vote|candidate marks/.test(s)) return "candidate_marks";
  if (/valid vote|valid candidate\/list/.test(s)) return "valid_votes";
  if (/list/.test(s)) return "list_votes";
  if (/elector/.test(s)) return "electors";
  if (/blank|invalid/.test(s)) return "including_blank_invalid";
  return "unknown";
}

export function nextDateCertainty(statusBlob: string): "conditional" | "expected" | "called" | "unknown" {
  const s = statusBlob.toLowerCase();
  if (/proposal|not yet verified|unverified|conditional/.test(s)) return "conditional";
  if (/called|decree|proclaimed/.test(s)) return "called";
  if (s.trim()) return "expected";
  return "unknown";
}

export function recomputeCounts(d: NormalizedDataset): void {
  d.release.validatedCounts = {
    currentOffices: d.offices.filter((o) => o.status === "current").length,
    historicalOffices: d.offices.filter((o) => o.status === "historical").length,
    histories: d.events.filter((e) => e.selectedHistoryRole !== "none").length,
    resultRows: d.events.reduce((n, e) => n + e.resultRows.length, 0),
    briefings: d.release.validatedCounts.briefings,
    recomputedFromNormalizedRecords: true,
  };
}

function sourceFactory(cid: string, countryLabel: string) {
  const sourceMap = new Map<string, EvidenceSource>();
  const source = (ref: unknown, supported: string, input?: Raw): string => {
    const original = text(ref);
    const id = `${cid}--${original && !urlsOnly(original) ? original : key("url", original)}`;
    if (!sourceMap.has(id)) {
      sourceMap.set(id, {
        id,
        publisher: countryLabel,
        title:
          text(input?.title) ||
          (urlsOnly(original)
            ? original
            : `Source reference ${original || "not supplied"}`),
        url: urlsOnly(input?.url) || urlsOnly(original),
        datesLabel: text(input?.retrieved || input?.accessed || input?.checked_on),
        fileHash: input?.sha256 ? text(input.sha256) : null,
        locator: text(input?.page || input?.source_pages) || null,
        supportedRecordIds: [],
        dataRights: "unknown",
      });
    }
    const row = sourceMap.get(id)!;
    if (supported && !row.supportedRecordIds.includes(supported)) {
      row.supportedRecordIds.push(supported);
    }
    return id;
  };
  return { sourceMap, source };
}

export function normalizeEuropeExtract(
  inventory: CountryPackageInventory,
  options?: { verifyFiles?: boolean },
): NormalizedDataset {
  const manifest = JSON.parse(
    readFileSync(path.join(inventory.dir, "manifest.json"), "utf8"),
  ) as {
    country: string;
    country_code?: string;
    region: string;
    research_checked_through?: string;
    packaged_on?: string;
    window?: { start: string; end: string; inclusive: boolean };
    coverage_complete: boolean;
    files?: Record<string, { sha256: string; bytes: number }>;
    individual_briefings?: number;
  };
  if (manifest.coverage_complete) {
    throw new Error(`${inventory.slug}: package must not claim complete coverage`);
  }
  if (options?.verifyFiles && manifest.files) {
    verifyManifestFiles(inventory.dir, manifest.files);
  }

  const tables = loadWorkbookTables(path.join(inventory.dir, "tables"));
  const coverage = existsSync(path.join(inventory.dir, "coverage.json"))
    ? (JSON.parse(readFileSync(path.join(inventory.dir, "coverage.json"), "utf8")) as Raw)
    : {};
  const notesRow = tables.get("Country notes")?.[0];
  const calendar = tables.get("Election calendar") ?? [];
  const offices = tables.get("Office register") ?? [];
  const histories = tables.get("History index") ?? [];
  const returns = tables.get("Detailed returns") ?? [];
  const control = tables.get("Governing control") ?? [];
  const polling = tables.get("Polling evidence") ?? [];
  const sourceRows = tables.get("Sources") ?? [];

  const cid = slug(manifest.country);
  const release = packageRelease(inventory);
  release.window = {
    startLabel: manifest.window?.start ?? "2026-09-08",
    endLabel: manifest.window?.end ?? "2028-03-08",
    inclusive: true,
    source: "imported_release",
  };
  release.snapshotLabel =
    manifest.research_checked_through ?? manifest.packaged_on ?? null;
  const d = emptyDataset(release);
  const { sourceMap, source } = sourceFactory(cid, manifest.country);
  const calendarStatus = calendar.map((row) => cellText(row["Date status"])).join(" ");

  d.countries.push({
    id: cid,
    regionId: regionIdFor(manifest.region),
    names: { official: manifest.country, short: manifest.country, aliases: [] },
    kind: polityKind(manifest.country, manifest.country_code),
    coverageStatus: "partial",
    notes:
      cellText(notesRow?.["Scope and remaining gaps"]) ||
      cellText(coverage.remaining) ||
      cellText(coverage.status) ||
      "Standalone country package; coverage remains partial.",
    extensions: {
      raw: {
        packageKind: inventory.kind,
        packageSlug: inventory.slug,
        coverage,
        country_code: manifest.country_code ?? null,
        site_ingestion_status: inventory.siteIngestionStatus,
      },
    },
  });

  for (const row of sourceRows) {
    const sid = cellText(row["Source ID"]);
    if (!sid) continue;
    source(sid, cid, {
      title: cellText(row["Title"]),
      url: cellText(row["Source URL"]),
      accessed: cellText(row["Accessed"]),
    });
    const created = sourceMap.get(`${cid}--${sid}`);
    if (created) created.publisher = cellText(row["Evidence grade"]) || manifest.country;
  }

  const officeIds = new Set<string>();
  for (const row of offices) {
    const oid = cellText(row["Office ID"]);
    if (!oid) throw new Error(`${inventory.slug}: office without ID`);
    if (officeIds.has(oid)) throw new Error(`${inventory.slug}: duplicate office ${oid}`);
    officeIds.add(oid);
    const jurisdiction = cellText(row["Jurisdiction"]);
    const officeName = cellText(row["Office"]);
    const geo = key("geo", [cid, jurisdiction, officeName]);
    if (!d.geographies.some((g) => g.id === geo)) {
      d.geographies.push({
        id: geo,
        countryId: cid,
        parentId: null,
        names: { official: jurisdiction || officeName, aliases: [] },
        sourceCodes: [oid],
        geometryAvailable: false,
      });
    }
    const src = [
      ...urlsOnlyList(row["Calendar evidence"], oid, source),
      ...urlsOnlyList(row["Detailed workbook"], oid, source),
    ];
    const nextLabel = cellText(row["Next polling date"]);
    const certainty = nextDateCertainty(`${calendarStatus} ${cellText(row["Calendar evidence"])}`);
    const nextId = nextLabel ? key("next", oid) : null;
    const selectedKeys = histories
      .filter((h) => cellText(h["Office ID"]) === oid)
      .map((h) => historyKey(oid, h["Year"], h["Ballot date if recorded"]));
    const office: OfficeRecord = {
      id: oid,
      countryId: cid,
      geographyId: geo,
      names: {
        official: `${jurisdiction} — ${officeName}`,
        short: `${jurisdiction} — ${officeName}`,
      },
      tier: officeTier(officeName, cellText(calendar[0]?.["Tier"])),
      officeType: officeName,
      status: "current",
      registryQualified: null,
      selectedHistoryKeys: selectedKeys,
      allHistoryKeys: selectedKeys,
      sourceIds: src,
      extensions: {
        raw: {
          note: cellText(row["Historical coverage"]),
          registry_status: cellText(row["Historical competition screen"]),
          polling_watch: cellText(row["Polling and government watch"]),
          originalPackage: `data/countries/${inventory.slug}`,
        },
      },
    };
    const coverageNote = cellText(row["Historical coverage"]);
    if (/partial|incomplete|pending|unverified|proposed/i.test(coverageNote)) {
      office.structuralLimitation = coverageNote;
    }
    if (nextId) {
      office.nextElection = {
        date: dateValue(nextLabel, certainty),
        eventId: nextId,
      };
      d.events.push({
        id: nextId,
        officeId: oid,
        countryId: cid,
        historyKey: nextId,
        date: dateValue(nextLabel, certainty),
        kind: /plebiscite|by-election/i.test(officeName) ? "special" : "unknown",
        selectedHistoryRole: "none",
        electoralSystem: "See source briefing",
        comparability: cellText(row["Historical coverage"]),
        ballotBasis: "unknown",
        voteShareUnit: "percent_0_100",
        legalOutcome: "not_held",
        proceedingIds: [],
        resultRows: [],
        sourceIds: src,
      });
    }
    d.offices.push(office);
    pushCompetitionMetrics(d, oid, row, selectedKeys);
  }

  const returnGroups = new Map<string, TableRow[]>();
  for (const row of returns) {
    const oid = cellText(row["Office ID"]);
    const hk = historyKey(oid, row["Year"], row["Ballot date if recorded"]);
    const list = returnGroups.get(hk) ?? [];
    list.push(row);
    returnGroups.set(hk, list);
  }

  const seenHistory = new Set<string>();
  for (const row of histories) {
    const oid = cellText(row["Office ID"]);
    if (!officeIds.has(oid)) {
      throw new Error(`${inventory.slug}: history for unknown office ${oid}`);
    }
    const hk = historyKey(oid, row["Year"], row["Ballot date if recorded"]);
    if (seenHistory.has(hk)) {
      throw new Error(`${inventory.slug}: duplicate history ${hk}`);
    }
    seenHistory.add(hk);
    const id = key("event", [cid, hk]);
    const url = cellText(row["Source URL"]);
    const sourceIds = url ? [source(url, id)] : [];
    const partyRows = returnGroups.get(hk) ?? [];
    const resultRows = partyRows.map((p, i) => resultFromReturn(id, p, cid, i));
    d.events.push({
      id,
      officeId: oid,
      countryId: cid,
      historyKey: hk,
      date: dateValue(
        cellText(row["Ballot date if recorded"]) || cellYear(row["Year"]),
      ),
      kind: eventKind(row["Coverage"] || row["Comparability status"]),
      selectedHistoryRole: "selected",
      electoralSystem: cellText(row["Vote basis"]),
      comparability: [cellText(row["Coverage"]), cellText(row["Comparability status"])]
        .filter(Boolean)
        .join(" · "),
      ballotBasis: ballotBasisOf(row["Vote basis"]),
      voteShareUnit: "percent_0_100",
      legalOutcome: legalOutcome({
        coverage: row["Coverage"],
        event_validity: row["Comparability status"],
      }),
      proceedingIds: [],
      resultRows,
      sourceIds,
      extensions: { raw: row },
    });
  }

  for (const row of control) {
    const oid = cellText(row["Office ID"]);
    if (!officeIds.has(oid)) continue;
    const url = cellText(row["Control source"]);
    const sid = url ? source(url, oid, { title: cellText(row["Reported current control"]) }) : null;
    d.officeholders.push({
      id: key("person-observation", [oid, row["Source date"], row["Reported current control"]]),
      officeId: oid,
      personLabel: cellText(row["Reported current control"]) || "Unlabelled control observation",
      role: cellText(row["Office"]) || "Source control observation",
      principalOrSubstitute: "unknown",
      asOf: dateValue(row["Source date"]),
      affiliationLabel: null,
      sourceIds: sid ? [sid] : [],
      impliesCurrentTenure: false,
      observationType: "dated_governing_control",
      notes: [cellText(row["Evidence limits"]), cellText(row["Polling assessment"])]
        .filter(Boolean)
        .join(" "),
      extensions: { raw: row },
    });
  }

  for (const row of polling) {
    const url = cellText(row["Source URL"]);
    const pid = key("poll", [cid, row["Pollster"], row["Publication date"]]);
    const sid = url ? source(url, cid, { title: `${cellText(row["Pollster"])} — ${cellText(row["Result"])}` }) : null;
    d.polls.push({
      id: pid,
      pollster: cellText(row["Pollster"]) || "Unlabelled pollster",
      population: cellText(row["Scope"]),
      scope: /local|parish|municipal/i.test(cellText(row["Scope"])) ? "local" : "national",
      countryId: cid,
      officeId: null,
      questionType: /approval|evaluation/i.test(cellText(row["Result"]))
        ? "presidential_approval"
        : /vote|intention/i.test(cellText(row["Scope"]))
          ? "vote_intention"
          : "other",
      questionText: cellText(row["Result"]),
      fieldwork: {
        precision: "range",
        certainty: "unknown",
        label:
          [cellText(row["Fieldwork start"]), cellText(row["Fieldwork end"])]
            .filter(Boolean)
            .join("–") || "Not supplied",
        rangeStart: cellText(row["Fieldwork start"])
          ? dateValue(row["Fieldwork start"])
          : undefined,
        rangeEnd: cellText(row["Fieldwork end"])
          ? dateValue(row["Fieldwork end"])
          : undefined,
      },
      published: cellText(row["Publication date"])
        ? dateValue(row["Publication date"])
        : null,
      sample: numberValue(row["Sample n"]),
      methodology: cellText(row["Method"]),
      responses: [],
      sourceIds: sid ? [sid] : [],
      supportsLocalConclusion: false,
      localConclusionNote:
        [cellText(row["Assessment"]), cellText(row["Limits"])]
          .filter(Boolean)
          .join(" ") || "National context only; not a local forecast.",
      extensions: { raw: row },
    });
  }

  const remaining =
    cellText(notesRow?.["Scope and remaining gaps"]) || cellText(coverage.remaining);
  if (remaining) {
    d.issues.push({
      id: key("issue", [cid, "remaining"]),
      affectedRecordIds: [cid],
      category: issueCategory(remaining),
      description: remaining,
      resolutionState: "open",
      requiredEvidence: remaining,
      sourceIds: [],
    });
  }

  const briefingDir = path.join(inventory.dir, "briefings");
  const briefingCount = existsSync(briefingDir)
    ? readdirSync(briefingDir).filter((name) => {
        if (!name.endsWith(".html")) return false;
        return officeIds.has(name.replace(/\.html$/, ""));
      }).length
    : 0;
  d.release.validatedCounts.briefings = briefingCount;
  d.sources = [...sourceMap.values()].map((s) => ({
    ...s,
    supportedRecordIds: s.supportedRecordIds.sort(),
  }));
  recomputeCounts(d);
  d.release.validatedCounts.briefings = briefingCount;
  return d;
}

function urlsOnlyList(
  value: unknown,
  supported: string,
  source: (ref: unknown, supported: string, input?: Raw) => string,
): string[] {
  const url = urlsOnly(value);
  return url ? [source(url, supported)] : [];
}

function resultFromReturn(
  eventId: string,
  row: TableRow,
  cid: string,
  index: number,
): NormalizedDataset["events"][number]["resultRows"][number] {
  const label =
    cellText(row["Candidate or list"]) ||
    cellText(row["Party or proposer"]) ||
    "Unlabelled source row";
  const votes = numberValue(row["Votes or marks"]);
  const share = numberValue(row["Share on stated basis"]);
  const seats = numberValue(row["Seats"]);
  const coverage = cellText(row["Result coverage"]);
  return {
    id: `${eventId}-r${index}`,
    label,
    candidate: cellText(row["Candidate or list"]) || null,
    partyCode: cellText(row["Party or proposer"]),
    partyNamespace: `${cid}/${cellYear(row["Year"]) ?? "unknown"}`,
    votes,
    share,
    shareUnit: "percent_0_100",
    seats,
    electedFlag: null,
    isSubstitute: false,
    evidenceStatus: /preliminary|provisional/i.test(coverage)
      ? "preliminary"
      : votes.status === "unknown" && share.status === "unknown"
        ? "unknown"
        : "recorded",
    extensions: { raw: row },
  };
}

function pushCompetitionMetrics(
  d: NormalizedDataset,
  officeId: string,
  row: TableRow,
  selectedKeys: string[],
) {
  const gaps = [
    row["Latest eligible gap pp"],
    row["Middle gap pp"],
    row["Oldest gap pp"],
  ];
  const numericGaps = gaps.map((g) =>
    typeof g === "number" && Number.isFinite(g) ? g : null,
  );
  const complete = numericGaps.every((g): g is number => g != null);
  const sourceScore = row["Competition score"];
  let value: NumericValue = { status: "unknown", value: null };
  let reviewStatus: MetricReviewStatus = "withheld";
  let scoreGate: boolean | null = false;
  let withholding =
    cellText(row["Historical competition screen"]) ||
    "Comparable three-cycle sequence unavailable";
  if (complete) {
    const computed = competitionIndex(numericGaps as [number, number, number]);
    if (typeof sourceScore === "number" && Number.isFinite(sourceScore)) {
      if (Math.abs(sourceScore - computed) > 1e-6) {
        throw new Error(`CI formula mismatch for ${officeId}`);
      }
    }
    value = numberValue(computed);
    reviewStatus = "cleared";
    scoreGate = true;
    withholding = "";
  }
  d.metrics.push({
    id: key("ci", officeId),
    officeId,
    kind: "competition_index",
    value,
    unit: "0–100 historical closeness",
    methodVersion: "ci.weighted-gap.v1",
    inputs: {
      latest_gap: numericGaps[0],
      previous_gap: numericGaps[1],
      oldest_gap: numericGaps[2],
    },
    selectedCycleKeys: selectedKeys,
    eligibility: cellText(row["Historical competition screen"]),
    reviewStatus,
    scoreGate,
    withholdingReason: withholding || null,
    comparisonStatus: cellText(row["Historical competition screen"]),
  });
  for (const [field, label] of [
    ["Pedersen interval 1 pp", "Latest interval"],
    ["Pedersen interval 2 pp", "Previous interval"],
    ["Mean Pedersen pp", "Both intervals mean"],
  ] as const) {
    const v = row[field];
    d.metrics.push({
      id: key("vol", [officeId, field]),
      officeId,
      kind: "pedersen_volatility",
      value: numberValue(v),
      unit: "percentage points",
      methodVersion: "pedersen.grouped.v1",
      inputs: { interval: label },
      selectedCycleKeys: selectedKeys,
      eligibility: cellText(row["Volatility interpretation"]),
      reviewStatus: typeof v === "number" ? "provisional" : "withheld",
      scoreGate: null,
      withholdingReason:
        typeof v === "number"
          ? null
          : cellText(row["Volatility interpretation"]) ||
            "Comparable grouped vectors unavailable for this interval",
      comparisonStatus: label,
    });
  }
}

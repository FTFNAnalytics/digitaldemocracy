import { readFileSync } from "node:fs";
import path from "node:path";
import type { NormalizedDataset } from "../../../schemas/v1/normalized";
import {
  dateValue,
  emptyDataset,
  issueCategory,
  key,
  numberValue,
  slug,
  urlsOnly,
} from "../../../scripts/import/normalize";
import type { CountryPackageInventory } from "./inventory";
import {
  officeTier,
  packageRelease,
  recomputeCounts,
  regionIdFor,
} from "./europe";

type NzSource = {
  id: string;
  publisher: string;
  title: string;
  url: string;
  checked_on: string;
  review_status: string;
  notes: string;
};

type NzCandidate = {
  id: string;
  name: string;
  affiliation: string | null;
  elected: boolean | null;
  votes: number | null;
  vote_share?: number | null;
  source_ids: string[];
};

type NzRace = {
  id: string;
  authority: string;
  district: string;
  office_type: string;
  election_date: string;
  election_type: string;
  electoral_system: string;
  evidence_status: string;
  notes: string;
  seats_to_fill: number;
  close_time_local: string | null;
  time_zone: string;
  candidate_roster_status: string;
  candidates: NzCandidate[];
  source_ids: string[];
  vacancy: {
    cause: string;
    current_holder: null;
    former_holder: string | null;
    status: string;
  };
  metrics: { status: string; reason: string; competitiveness_index: null; pedersen_volatility: null };
};

type NzHistory = {
  id: string;
  related_race_id: string;
  election_date: string;
  declaration_date: string;
  election_type: string;
  electoral_system: string;
  evidence_status: string;
  vote_unit: string;
  seats: number;
  results: NzCandidate[];
  source_ids: string[];
  metrics: { status: string; reason: string };
  informal_papers: number;
  blank_papers: number;
  ballot_total: null;
};

type NzGap = { priority: string; race_id: string | null; task: string };

type NzDataset = {
  country: string;
  region: string;
  snapshot_date: string;
  site_ingestion_status: string;
  coverage: Record<string, unknown>;
  sources: NzSource[];
  races: NzRace[];
  histories: NzHistory[];
  research_gaps: NzGap[];
  conventions?: Record<string, string>;
};

export function normalizeNewZealandPackage(
  inventory: CountryPackageInventory,
): NormalizedDataset {
  const raw = JSON.parse(
    readFileSync(path.join(inventory.dir, "dataset.json"), "utf8"),
  ) as NzDataset;
  if (raw.site_ingestion_status !== "pending_adapter") {
    throw new Error("New Zealand package unexpectedly claims ingestion");
  }
  const cid = slug(raw.country);
  const release = packageRelease(inventory);
  release.snapshotLabel = raw.snapshot_date;
  const d = emptyDataset(release);
  const coverage = raw.coverage;
  d.countries.push({
    id: cid,
    regionId: regionIdFor(raw.region),
    names: { official: raw.country, short: raw.country, aliases: [] },
    kind: "sovereign_country",
    coverageStatus: "partial",
    notes:
      "Initial local by-election research only. Not a complete national inventory. Multi-seat candidate marks are not unique voters.",
    extensions: {
      raw: {
        packageKind: inventory.kind,
        packageSlug: inventory.slug,
        coverage,
        conventions: raw.conventions ?? null,
        site_ingestion_status: raw.site_ingestion_status,
      },
    },
  });

  const sourceMap = new Map<string, NormalizedDataset["sources"][number]>();
  for (const s of raw.sources) {
    sourceMap.set(`${cid}--${s.id}`, {
      id: `${cid}--${s.id}`,
      publisher: s.publisher,
      title: s.title,
      url: urlsOnly(s.url),
      datesLabel: s.checked_on,
      fileHash: null,
      locator: null,
      supportedRecordIds: [cid],
      dataRights: "unknown",
    });
  }
  const refs = (ids: string[], supported: string) =>
    ids.map((id) => {
      const sid = `${cid}--${id}`;
      const row = sourceMap.get(sid);
      if (row && !row.supportedRecordIds.includes(supported)) {
        row.supportedRecordIds.push(supported);
      }
      return sid;
    });

  const races = new Map(raw.races.map((r) => [r.id, r]));
  for (const race of raw.races) {
    const geo = key("geo", [cid, race.authority, race.district]);
    if (!d.geographies.some((g) => g.id === geo)) {
      d.geographies.push({
        id: geo,
        countryId: cid,
        parentId: null,
        names: { official: `${race.authority} / ${race.district}`, aliases: [] },
        sourceCodes: [race.id],
        geometryAvailable: false,
      });
    }
    const historyRows = raw.histories.filter((h) => h.related_race_id === race.id);
    const historyKeys = historyRows.map((h) => h.id);
    const nextId = key("next", race.id);
    d.offices.push({
      id: race.id,
      countryId: cid,
      geographyId: geo,
      names: {
        official: `${race.district} — ${race.office_type.replaceAll("_", " ")}`,
        short: race.district,
      },
      tier: officeTier(race.office_type),
      officeType: race.office_type.replaceAll("_", " "),
      status: "current",
      registryQualified: null,
      nextElection: {
        date: dateValue(race.election_date, "expected"),
        eventId: nextId,
      },
      selectedHistoryKeys: historyKeys,
      allHistoryKeys: historyKeys,
      structuralLimitation:
        coverage.latest_three_history_complete === false
          ? "Latest-three comparable history is not complete for this batch."
          : undefined,
      sourceIds: refs(race.source_ids, race.id),
      extensions: {
        raw: {
          note: race.notes,
          vacancy: race.vacancy,
          evidence_status: race.evidence_status,
          candidate_roster_status: race.candidate_roster_status,
          originalPackage: "data/countries/new-zealand",
        },
      },
    });
    d.events.push({
      id: nextId,
      officeId: race.id,
      countryId: cid,
      historyKey: nextId,
      date: dateValue(
        race.close_time_local
          ? `${race.election_date} ${race.close_time_local} ${race.time_zone}`
          : race.election_date,
        "expected",
      ),
      kind: "special",
      selectedHistoryRole: "none",
      electoralSystem: race.electoral_system,
      comparability: race.notes,
      ballotBasis: race.electoral_system === "FPP" ? "candidate_marks" : "unknown",
      voteShareUnit: "percent_0_100",
      legalOutcome: "not_held",
      proceedingIds: [],
      resultRows: [],
      sourceIds: refs(race.source_ids, nextId),
      extensions: {
        raw: {
          candidates: race.candidates,
          seats_to_fill: race.seats_to_fill,
          election_type: race.election_type,
        },
      },
    });
    for (const candidate of race.candidates) {
      if (candidate.votes != null || candidate.elected != null) {
        throw new Error(`${candidate.id}: future result invented`);
      }
      d.officeholders.push({
        id: candidate.id,
        officeId: race.id,
        personLabel: candidate.name,
        role: "Declared candidate (election not held)",
        principalOrSubstitute: "unknown",
        asOf: dateValue(race.election_date),
        affiliationLabel: candidate.affiliation,
        sourceIds: refs(candidate.source_ids, candidate.id),
        impliesCurrentTenure: false,
        observationType: race.candidate_roster_status,
        notes: "Prospective nomination. Not a result and not current tenure.",
        extensions: { raw: candidate },
      });
    }
    d.metrics.push({
      id: key("ci", race.id),
      officeId: race.id,
      kind: "competition_index",
      value: { status: "unknown", value: null },
      unit: "0–100 historical closeness",
      methodVersion: "ci.weighted-gap.v1",
      inputs: { latest_gap: null, previous_gap: null, oldest_gap: null },
      selectedCycleKeys: historyKeys,
      eligibility: race.metrics.reason,
      reviewStatus: "withheld",
      scoreGate: false,
      withholdingReason: race.metrics.reason,
      comparisonStatus: race.metrics.status,
    });
  }

  for (const history of raw.histories) {
    if (!races.has(history.related_race_id)) {
      throw new Error(`${history.id}: orphan history`);
    }
    d.events.push({
      id: history.id,
      officeId: history.related_race_id,
      countryId: cid,
      historyKey: history.id,
      date: dateValue(history.election_date),
      kind: history.election_type === "ordinary" ? "ordinary" : "special",
      selectedHistoryRole: "selected",
      electoralSystem: history.electoral_system,
      comparability: history.evidence_status,
      ballotBasis:
        history.vote_unit === "candidate_marks" ? "candidate_marks" : "unknown",
      voteShareUnit: "percent_0_100",
      legalOutcome:
        history.evidence_status === "provisional_legacy_mirror"
          ? "preliminary"
          : "unknown",
      proceedingIds: [],
      resultRows: history.results.map((row) => ({
        id: row.id,
        label: row.name,
        candidate: row.name,
        partyCode: row.affiliation ?? "",
        partyNamespace: `${cid}/${history.id}`,
        votes: numberValue(row.votes),
        share: numberValue(row.vote_share ?? null),
        shareUnit: "percent_0_100" as const,
        seats: { status: "not_applicable" as const, value: null },
        electedFlag: row.elected,
        isSubstitute: false,
        evidenceStatus:
          history.evidence_status === "provisional_legacy_mirror"
            ? ("preliminary" as const)
            : ("recorded" as const),
        extensions: { raw: row },
      })),
      sourceIds: refs(history.source_ids, history.id),
      extensions: {
        raw: {
          declaration_date: history.declaration_date,
          informal_papers: history.informal_papers,
          blank_papers: history.blank_papers,
          ballot_total: history.ballot_total,
          seats: history.seats,
          metrics: history.metrics,
        },
      },
    });
  }

  for (const gap of raw.research_gaps) {
    const id = key("issue", [cid, gap.task, gap.race_id]);
    d.issues.push({
      id,
      affectedRecordIds: gap.race_id ? [gap.race_id] : [cid],
      category: issueCategory(gap.task),
      description: gap.task,
      resolutionState: "open",
      requiredEvidence: gap.task,
      sourceIds: [],
    });
    if (gap.race_id && races.has(gap.race_id)) {
      d.completionQueue.push({
        id: key("queue", [gap.race_id, gap.task]),
        officeId: gap.race_id,
        countryId: cid,
        requirement: gap.task,
        category: issueCategory(gap.task),
      });
    }
  }

  d.sources = [...sourceMap.values()].map((s) => ({
    ...s,
    supportedRecordIds: s.supportedRecordIds.sort(),
  }));
  recomputeCounts(d);
  d.release.validatedCounts.briefings = 0;
  return d;
}

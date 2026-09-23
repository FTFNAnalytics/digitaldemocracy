/* eslint-disable @typescript-eslint/no-explicit-any -- heterogeneous legacy input is validated at the adapter boundary; raw evidence is retained */
import { createHash } from "node:crypto";
import type {
  NormalizedDataset,
  ResearchDate,
  NumericValue,
  LegalOutcome,
  EventKind,
  ElectionEvent,
  EvidenceSource,
  IssueCategory,
} from "../../schemas/v1/normalized";
import { competitionIndex } from "../../lib/observatory/metrics";

export type Raw = Record<string, any>;
export const digest = (v: string | Uint8Array) =>
  createHash("sha256").update(v).digest("hex");
export const stable = (v: any): string =>
  JSON.stringify(v, (_k, x) =>
    x && typeof x === "object" && !Array.isArray(x)
      ? Object.fromEntries(
          Object.keys(x)
            .sort()
            .map((k) => [k, x[k]]),
        )
      : x,
  );
export const key = (prefix: string, v: any) =>
  `${prefix}-${digest(stable(v)).slice(0, 24)}`;
export const slug = (v: string) =>
  v
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const text = (v: any): string =>
  v == null ? "" : typeof v === "string" ? v : stable(v);
export const numberValue = (v: any): NumericValue =>
  typeof v === "number" && Number.isFinite(v)
    ? { status: v === 0 ? "zero" : "recorded", value: v }
    : { status: "unknown", value: null };
export const urlsOnly = (v: any) =>
  typeof v === "string" && /^https?:\/\//i.test(v) ? v : null;
export const SOUTH = new Set([
  "Argentina",
  "Bolivia",
  "Brazil",
  "Chile",
  "Colombia",
  "Ecuador",
  "Guyana",
  "Paraguay",
  "Peru",
  "Suriname",
  "Uruguay",
  "Venezuela",
]);
const NORTH = new Set(["Mexico"]);
const CENTRAL = new Set([
  "Belize",
  "Costa Rica",
  "El Salvador",
  "Guatemala",
  "Honduras",
  "Nicaragua",
  "Panama",
]);
export const regionFor = (c: string) =>
  SOUTH.has(c)
    ? "south-america"
    : NORTH.has(c)
      ? "north-america"
      : CENTRAL.has(c)
        ? "central-america"
        : "caribbean";
export function dateValue(
  value: any,
  certainty: ResearchDate["certainty"] = "unknown",
): ResearchDate {
  const label = text(value).trim();
  if (!label)
    return {
      precision: "unknown",
      certainty: "unknown",
      label: "Date not supplied",
    };
  // Only explicit ISO date prefixes or a standalone year are normalized. Free text remains verbatim.
  const m = label.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(?=$|[;\s])/);
  if (m) {
    const year = Number(m[1]),
      month = m[2] ? Number(m[2]) : undefined,
      day = m[3] ? Number(m[3]) : undefined;
    if (
      (!month || (month >= 1 && month <= 12)) &&
      (!day ||
        (day >= 1 && day <= new Date(Date.UTC(year, month!, 0)).getUTCDate()))
    )
      return {
        label,
        certainty,
        precision: day ? "day" : month ? "month" : "year",
        year,
        ...(month ? { month } : {}),
        ...(day ? { day } : {}),
      };
  }
  const named = label.match(
    /^(?:(\d{1,2})\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})(?=$|[;\s])/i,
  );
  if (named) {
    const month =
      [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ].indexOf(named[2].toLowerCase()) + 1;
    const year = Number(named[3]),
      day = named[1] ? Number(named[1]) : undefined;
    if (
      !day ||
      (day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate())
    )
      return {
        precision: day ? "day" : "month",
        certainty,
        label,
        year,
        month,
        ...(day ? { day } : {}),
      };
  }
  return { precision: "unknown", certainty, label };
}
export function legalOutcome(h: Raw): LegalOutcome {
  const explicit = text(h.event_validity).toLowerCase();
  if (/annulled|failed/.test(explicit)) return "annulled";
  if (explicit === "final proclaimed election") return "certified";
  if (h.completed_event === false) return "unknown";
  if (/preliminary|provisional/.test(text(h.coverage).toLowerCase()))
    return "preliminary";
  if (/superseded/.test(text(h.coverage).toLowerCase())) return "superseded";
  return "unknown"; // Statistical publication and elected flags do not prove legal certification.
}
export function eventKind(v: any): EventKind {
  const s = text(v).toLowerCase();
  if (/repeat|replacement/.test(s)) return "repeated";
  if (/indirect/.test(s)) return "indirect";
  if (/special|supplement|by-election|extraordinary|first local/.test(s))
    return "special";
  if (
    /ordinary|ordinária|general election|municipal declaration|renewal|shared ballot/.test(
      s,
    )
  )
    return "ordinary";
  return "unknown";
}
export function issueCategory(s: string): IssueCategory {
  if (/structural|new.unit|new office/i.test(s)) return "structural_exception";
  if (/registry|register|geographic|boundar/i.test(s)) return "registry_gap";
  if (/annul|replacement|event|repeat/i.test(s)) return "unresolved_event";
  if (/missing|returns|older/i.test(s)) return "missing_returns";
  return "other";
}
export function readableIssue(v: any): string {
  if (typeof v === "string") {
    try {
      const d = JSON.parse(v);
      if (d && typeof d === "object" && d.detail) return text(d.detail);
    } catch {}
  }
  return text(v);
}
export function isCountryDocument(d: any): boolean {
  return (
    !!d &&
    typeof d.country === "string" &&
    Array.isArray(d.offices) &&
    Array.isArray(d.histories) &&
    Array.isArray(d.sources) &&
    Array.isArray(d.rosters)
  );
}
export function emptyDataset(
  release: NormalizedDataset["release"],
): NormalizedDataset {
  return {
    release,
    regions: [],
    countries: [],
    geographies: [],
    offices: [],
    events: [],
    proceedings: [],
    partyMappings: [],
    officeholders: [],
    registers: [],
    polls: [],
    metrics: [],
    sources: [],
    issues: [],
    completionQueue: [],
    artifacts: [],
  };
}
export function normalizeCountry(
  raw: Raw,
  release: NormalizedDataset["release"],
  supplementary: any[] = [],
): NormalizedDataset {
  if (!isCountryDocument(raw))
    throw new Error("Unsupported country record shape");
  const d = emptyDataset(release),
    cid = slug(raw.country);
  const sourceMap = new Map<string, EvidenceSource>();
  const source = (ref: any, supported: string, input?: Raw): string => {
    const original = text(ref);
    const id = `${cid}--${original && !urlsOnly(original) ? original : key("url", original)}`;
    if (!sourceMap.has(id))
      sourceMap.set(id, {
        id,
        publisher: raw.country,
        title:
          input?.title ||
          (urlsOnly(original)
            ? original
            : `Source reference ${original || "not supplied"}`),
        url: urlsOnly(input?.url) || urlsOnly(original),
        datesLabel: text(input?.retrieved || input?.accessed),
        fileHash: input?.sha256 || null,
        locator: text(input?.page || input?.source_pages) || null,
        supportedRecordIds: [],
        dataRights: "unknown",
      });
    const s = sourceMap.get(id)!;
    if (supported && !s.supportedRecordIds.includes(supported))
      s.supportedRecordIds.push(supported);
    return id;
  };
  for (const s of raw.sources) source(s.id || s.source_id, cid, s);
  const refs = (r: Raw, supported: string) => [
    ...new Set(
      [
        r.source_id,
        r.seat_source_id,
        r.legal_source_id,
        r.call_source_id,
        r.source_url,
        r._source_url,
        r.source,
        ...(Array.isArray(r.source_ids) ? r.source_ids : []),
      ]
        .filter((v) => typeof v === "string" && v)
        .map((v) => source(v, supported)),
    ),
  ];
  d.countries.push({
    id: cid,
    regionId: regionFor(raw.country),
    names: { official: raw.country, short: raw.country, aliases: [] },
    kind: "sovereign_country",
    coverageStatus: "partial",
    notes: text(raw.coverage?.note),
    extensions: { raw: { coverage: raw.coverage } },
  });
  const offices = new Map<string, Raw>();
  for (const o of raw.offices) {
    if (
      typeof o.id !== "string" ||
      offices.has(o.id) ||
      !Array.isArray(o.selected_keys) ||
      !Array.isArray(o.all_keys)
    )
      throw new Error(`Invalid office identity/selection: ${o.id}`);
    offices.set(o.id, o);
    const geo = key("geo", [cid, o.region, o.name]);
    if (!d.geographies.some((g) => g.id === geo))
      d.geographies.push({
        id: geo,
        countryId: cid,
        parentId: null,
        names: {
          official: [o.name, o.region].filter(Boolean).join(" / "),
          aliases: [],
        },
        sourceCodes: [],
        geometryAvailable: false,
      });
    const src = (o.sources || [])
      .filter((s: any) => typeof s === "string")
      .map((s: string) => source(s, o.id));
    const nextId = o.current && o.date ? key("next", o.id) : null;
    const certainty: ResearchDate["certainty"] =
      /conditional|provisional/i.test(text(o.date))
        ? "conditional"
        : /call/i.test(text(o.registry_status)) &&
            /verified/i.test(text(o.registry_status)) &&
            !/pending/i.test(text(o.registry_status))
          ? "called"
          : o.date
            ? "expected"
            : "unknown";
    d.offices.push({
      id: o.id,
      countryId: cid,
      geographyId: geo,
      names: {
        official: `${o.name} — ${o.office}`,
        short: `${o.name} — ${o.office}`,
      },
      tier: /regional/i.test(o.tier)
        ? "regional"
        : /municipal/i.test(o.tier)
          ? "municipal"
          : "other",
      officeType: text(o.office),
      status: o.current ? "current" : "historical",
      registryQualified: /Ordinary office verified/i.test(
        text(o.registry_status),
      )
        ? true
        : null,
      ...(/structural|new.unit|new office|first election/i.test(
        text(o.local_note),
      )
        ? { structuralLimitation: text(o.local_note) }
        : {}),
      ...(nextId
        ? {
            nextElection: {
              date: dateValue(o.date, certainty),
              eventId: nextId,
            },
          }
        : {}),
      selectedHistoryKeys: o.selected_keys,
      allHistoryKeys: o.all_keys,
      sourceIds: src,
      extensions: {
        raw: {
          note: o.local_note,
          registry_status: o.registry_status,
          current_government: o.current_government,
          current_government_source: o.current_government_source,
          current_control_status: o.current_control_status,
          as_elected_control: o.as_elected_control,
          vote_cycles: o.vote_cycles,
          seat_cycles: o.seat_cycles,
          event_review: o.event_review,
          originalCountryFile: `Data/${raw.country.replaceAll(" ", "_")}.json`,
        },
      },
    });
    if (nextId)
      d.events.push({
        id: nextId,
        officeId: o.id,
        countryId: cid,
        historyKey: nextId,
        date: dateValue(o.date, certainty),
        kind: "unknown",
        selectedHistoryRole: "none",
        electoralSystem: "See source briefing",
        comparability: text(o.local_note),
        ballotBasis: "unknown",
        voteShareUnit: "percent_0_100",
        legalOutcome: "not_held",
        proceedingIds: [],
        resultRows: [],
        sourceIds: src,
      });
    const gaps = Array.isArray(o.gaps) ? o.gaps : [];
    const cleared =
      o.score_gate === true &&
      gaps.length === 3 &&
      gaps.every((v: any) => typeof v === "number" && Number.isFinite(v));
    const val = cleared
      ? competitionIndex(gaps as [number, number, number])
      : o.comparison_ci;
    d.metrics.push({
      id: key("ci", o.id),
      officeId: o.id,
      kind: "competition_index",
      value: numberValue(val),
      unit: "0–100 historical closeness",
      methodVersion: "ci.weighted-gap.v1",
      inputs: {
        latest_gap: gaps[0] ?? null,
        previous_gap: gaps[1] ?? null,
        oldest_gap: gaps[2] ?? null,
      },
      selectedCycleKeys: o.selected_keys,
      eligibility: text(o.event_review),
      reviewStatus: cleared
        ? "cleared"
        : typeof val === "number"
          ? "provisional"
          : "withheld",
      scoreGate: cleared,
      withholdingReason:
        typeof val === "number"
          ? null
          : text(o.local_note || o.event_review) ||
            "Comparable three-cycle sequence unavailable",
      comparisonStatus: text(o.comparison_status || o.basis),
    });
    for (const [field, label] of [
      ["volatility_latest", "Latest interval"],
      ["volatility_previous", "Previous interval"],
      ["volatility_mean", "Both intervals mean"],
    ]) {
      const v = o[field];
      d.metrics.push({
        id: key("vol", [o.id, field]),
        officeId: o.id,
        kind: "pedersen_volatility",
        value: numberValue(v),
        unit: "percentage points",
        methodVersion: "pedersen.grouped.v1",
        inputs: {
          interval: label,
          groups: stable(o.volatility_groups || []),
          vectors: stable(o.volatility_vectors || []),
        },
        selectedCycleKeys: o.selected_keys,
        eligibility: text(o.volatility_method),
        reviewStatus: typeof v === "number" ? "provisional" : "withheld",
        scoreGate: null,
        withholdingReason:
          typeof v === "number"
            ? null
            : "Comparable grouped vectors unavailable for this interval",
        comparisonStatus: label,
      });
    }
  }
  const histKeys = new Set<string>();
  for (const h of raw.histories) {
    if (
      !offices.has(h.jurisdiction_id) ||
      typeof h._key !== "string" ||
      histKeys.has(h._key) ||
      !Array.isArray(h.parties)
    )
      throw new Error(`Invalid history: ${h._key}`);
    histKeys.add(h._key);
    const o = offices.get(h.jurisdiction_id)!;
    const id = key("event", [cid, h._key]);
    const { parties, ...historyEvidence } = h;
    const basis = text(h.basis).toLowerCase();
    const ballotBasis = /mark|multiple|multi.vote/.test(basis)
      ? "candidate_marks"
      : /valid vote/.test(basis)
        ? "valid_votes"
        : /list|candidate/.test(basis)
          ? "list_votes"
          : "unknown";
    const resultRows = parties.map((p: Raw, i: number) => ({
      id: `${id}-r${i}`,
      label:
        text(p.party || p.party_label || p.candidate) ||
        "Unlabelled source row",
      candidate: p.candidate ? text(p.candidate) : null,
      partyCode: text(p.party_code ?? p.party_id),
      partyNamespace: `${cid}/${h.source_id || "unknown"}/${h.year}`,
      votes: numberValue(p.votes),
      share: numberValue(p.reported_share ?? p.share),
      shareUnit: "percent_0_100" as const,
      seats: numberValue(p.seats),
      electedFlag:
        p.reported_elected === true || p.reported_elected === 1
          ? true
          : p.reported_elected === false || p.reported_elected === 0
            ? false
            : null,
      isSubstitute: p.substitute === true,
      evidenceStatus: /preliminary|provisional/i.test(text(h.coverage))
        ? ("preliminary" as const)
        : ("recorded" as const),
      extensions: { raw: p },
    }));
    const event: ElectionEvent = {
      id,
      officeId: h.jurisdiction_id,
      countryId: cid,
      historyKey: h._key,
      date: dateValue(h.event_date || h.year),
      kind: eventKind(h.event_kind || h.round),
      selectedHistoryRole: o.selected_keys.includes(h._key)
        ? "selected"
        : "other",
      electoralSystem: text(h.basis),
      comparability: text(h.comparability || h.coverage),
      ballotBasis,
      voteShareUnit: "percent_0_100",
      legalOutcome: legalOutcome(h),
      proceedingIds: [],
      resultRows,
      sourceIds: refs(h, id),
      extensions: { raw: historyEvidence },
    };
    if (h.round || /recount|annul|repeat/i.test(text(h.event_kind))) {
      const pid = key("proceeding", [id, h.round, h.event_kind]);
      event.proceedingIds.push(pid);
      d.proceedings.push({
        id: pid,
        eventId: id,
        kind: /recount/i.test(text(h.event_kind))
          ? "recount"
          : event.legalOutcome === "annulled"
            ? "annulment"
            : /runoff|second|2/.test(text(h.round))
              ? "runoff"
              : "first_round",
        round: typeof h.round === "number" ? h.round : null,
        supersedesId: null,
        supersededById: null,
        legalOutcome: event.legalOutcome,
        notes: `Source event kind: ${text(h.event_kind)}; round: ${text(h.round)}. No unverified legal relationship inferred.`,
      });
    }
    d.events.push(event);
  }
  for (const o of raw.offices)
    for (const k of o.all_keys)
      if (!histKeys.has(k)) throw new Error(`Missing referenced history ${k}`);
  // Exact duplicate observations are mirrors. Distinct dates, labels and claims are retained.
  const observations = new Map<string, Raw>();
  for (const r of [...raw.rosters, ...supplementary])
    observations.set(stable(r), r);
  for (const [identity, r] of observations) {
    if (!offices.has(r.jurisdiction_id)) continue; // country-only and other evidence remains in original-source downloads
    const oid = r.jurisdiction_id;
    if (r.record_type === "official_electoral_register") {
      d.registers.push({
        id: key("register", identity),
        officeId: oid,
        geographyId: d.offices.find((o) => o.id === oid)!.geographyId,
        asOf: dateValue(r.snapshot),
        electorCount: numberValue(r.electors_august),
        sourceIds: [
          ...refs(r, oid),
          ...(r.register_source_id ? [source(r.register_source_id, oid)] : []),
        ],
        notes:
          "Dated CNE administrative observation; not historical turnout. July count, difference and spending limit are retained separately.",
        extensions: { raw: r },
      });
      continue;
    }
    const name =
      r.candidate ||
      (/directory|membership|roster|elected/i.test(text(r.record_type))
        ? r.name
        : null);
    if (!name || typeof name !== "string") continue;
    d.officeholders.push({
      id: key("person-observation", identity),
      officeId: oid,
      personLabel: name,
      role: text(r.role || r.office) || "Source roster entry",
      principalOrSubstitute:
        r.substitute === true
          ? "substitute"
          : r.substitute === false
            ? "principal"
            : "unknown",
      asOf: dateValue(
        r.snapshot || r.certification_date || r.event_date || r.year,
      ),
      affiliationLabel: r.party ? text(r.party) : null,
      sourceIds: refs(r, oid),
      impliesCurrentTenure: false,
      observationType: text(r.record_type) || "Source roster",
      notes: text(r.status || r.note),
      extensions: { raw: r },
    });
  }
  const polls = new Map<string, Raw>();
  for (const p of [
    ...(raw.polling || []),
    ...raw.offices.flatMap((o: Raw) => o.polling_context || []),
  ])
    polls.set(stable(p), p);
  for (const [identity, p] of polls) {
    const local = Array.isArray(p.office_ids) && p.office_ids.length > 0;
    const contexts = local ? p.office_ids : [null];
    for (const oid of contexts) {
      if (oid && !offices.has(oid)) continue;
      const approval = /approval/i.test(text(p.measure));
      const responses = approval
        ? [
            ["Approve", p.approve_pct],
            ["Disapprove", p.disapprove_pct],
            ["Unsure", p.unsure_pct],
          ]
        : [
            [p.incumbent_candidate, p.incumbent_share],
            [p.opposition_candidate, p.opposition_share],
          ];
      if (p.url)
        source(p.url, oid || cid, {
          ...p,
          title: `${text(p.pollster)} — ${text(p.measure)}`,
          sha256: p.source_sha256,
        });
      d.polls.push({
        id: key("poll", [identity, oid]),
        pollster: text(p.pollster),
        population: text(p.population || p.scope),
        scope: local ? "local" : "national",
        countryId: cid,
        officeId: oid,
        questionType: approval
          ? "presidential_approval"
          : /vote|presidential|mayor|runoff|election/i.test(text(p.measure))
            ? "vote_intention"
            : "other",
        questionText: text(p.measure),
        fieldwork: {
          precision: "range",
          certainty: "unknown",
          label:
            [p.fieldwork_start, p.fieldwork_end].filter(Boolean).join("–") ||
            "Not supplied",
          rangeStart: dateValue(p.fieldwork_start),
          rangeEnd: dateValue(p.fieldwork_end),
        },
        published: p.publication_date ? dateValue(p.publication_date) : null,
        sample: numberValue(p.sample),
        methodology: text(p.methodology),
        responses: responses
          .filter(([label]) => label)
          .map(([label, value]) => ({
            label: text(label),
            value: numberValue(value),
            unit: "percent_0_100",
          })),
        sourceIds: refs({ ...p, source: p.url }, oid || cid),
        supportsLocalConclusion: false,
        localConclusionNote:
          text(p.local_forecast || p.interpretation) ||
          "Local government-change risk unassessed",
        extensions: { raw: p },
      });
    }
  }
  for (const r of raw.issues || []) {
    const id = key("issue", [cid, r]);
    const desc = [text(r.issue), readableIssue(r.detail)]
      .filter(Boolean)
      .join(": ");
    d.issues.push({
      id,
      affectedRecordIds: offices.has(r.id) ? [r.id] : [cid],
      category: issueCategory(text(r.issue)),
      description: desc,
      resolutionState: "open",
      requiredEvidence: readableIssue(r.detail),
      sourceIds: refs(r, offices.has(r.id) ? r.id : cid),
    });
  }
  d.issues = [...new Map(d.issues.map((i) => [i.id, i])).values()];
  d.sources = [...sourceMap.values()].map((s) => ({
    ...s,
    supportedRecordIds: s.supportedRecordIds.sort(),
  }));
  return d;
}

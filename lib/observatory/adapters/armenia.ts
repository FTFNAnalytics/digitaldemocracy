import { readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import type { NormalizedDataset } from "../../../schemas/v1/normalized";
import {
  dateValue,
  emptyDataset,
  eventKind,
  issueCategory,
  key,
  legalOutcome,
  numberValue,
  slug,
  urlsOnly,
} from "../../../scripts/import/normalize";
import type { CountryPackageInventory } from "./inventory";
import {
  ballotBasisOf,
  nextDateCertainty,
  officeTier,
  packageRelease,
  polityKind,
  recomputeCounts,
  regionIdFor,
} from "./europe";
import { extractUstar, sha256 } from "./tar";
import {
  cellText,
  cellYear,
  historyKey,
  zipTable,
  type TableRow,
  type WorkbookTable,
} from "./tables";

const unpackCache = new Map<string, Map<string, Buffer>>();

export function unpackArmeniaPayload(dir: string): Map<string, Buffer> {
  const cached = unpackCache.get(dir);
  if (cached) return cached;
  const manifest = JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8")) as {
    payload_sha256: string;
    chunks: Record<string, { sha256: string; bytes: number }>;
  };
  const parts: Buffer[] = [];
  for (const [relative, expected] of Object.entries(manifest.chunks)) {
    const bytes = readFileSync(path.join(dir, relative));
    if (bytes.length !== expected.bytes || sha256(bytes) !== expected.sha256) {
      throw new Error(`Armenia payload chunk mismatch: ${relative}`);
    }
    parts.push(bytes);
  }
  const gz = Buffer.concat(parts);
  if (sha256(gz) !== manifest.payload_sha256) {
    throw new Error("Armenia concatenated payload checksum mismatch");
  }
  const files = extractUstar(gunzipSync(gz));
  unpackCache.set(dir, files);
  return files;
}

function tableFromBuffer(bytes: Buffer): TableRow[] {
  return zipTable(JSON.parse(bytes.toString("utf8")) as WorkbookTable);
}

export function normalizeArmeniaPackage(
  inventory: CountryPackageInventory,
): NormalizedDataset {
  const files = unpackArmeniaPayload(inventory.dir);
  const manifest = JSON.parse(
    readFileSync(path.join(inventory.dir, "manifest.json"), "utf8"),
  ) as {
    country: string;
    research_snapshot?: string;
    packaged?: string;
    window?: { start: string; end: string };
    website_ingestion?: string;
  };
  const coverage = JSON.parse(
    readFileSync(path.join(inventory.dir, "coverage.json"), "utf8"),
  ) as Record<string, string>;
  const cid = slug(manifest.country);
  const release = packageRelease(inventory);
  release.window = {
    startLabel: manifest.window?.start ?? "2026-09-08",
    endLabel: manifest.window?.end ?? "2028-03-08",
    inclusive: true,
    source: "imported_release",
  };
  release.snapshotLabel = manifest.research_snapshot ?? manifest.packaged ?? null;
  const d = emptyDataset(release);
  const notes = tableFromBuffer(files.get("tables/master/country-notes.json")!)[0];
  const calendar = tableFromBuffer(files.get("tables/master/election-calendar.json")!);
  const offices = tableFromBuffer(files.get("tables/master/office-register.json")!);
  const masterSources = tableFromBuffer(files.get("tables/master/sources.json")!);
  const companionSources = files.has("tables/companion/sources.json")
    ? tableFromBuffer(files.get("tables/companion/sources.json")!)
    : [];
  const companionHistories = files.has("tables/companion/histories.json")
    ? tableFromBuffer(files.get("tables/companion/histories.json")!)
    : [];
  const companionResults = files.has("tables/companion/full-results.json")
    ? tableFromBuffer(files.get("tables/companion/full-results.json")!)
    : [];
  const indexHistories = JSON.parse(
    files.get("history-index.json")!.toString("utf8"),
  ) as Array<Record<string, unknown>>;

  d.countries.push({
    id: cid,
    regionId: regionIdFor("Europe"),
    names: { official: manifest.country, short: manifest.country, aliases: [] },
    kind: polityKind(manifest.country),
    coverageStatus: "partial",
    notes:
      cellText(notes?.["Scope and remaining gaps"]) ||
      coverage.remaining ||
      "Standalone Armenia package; coverage remains partial.",
    extensions: {
      raw: {
        packageKind: inventory.kind,
        packageSlug: inventory.slug,
        coverage,
        website_ingestion: manifest.website_ingestion ?? "pending",
        packed: true,
      },
    },
  });

  const sourceMap = new Map<string, NormalizedDataset["sources"][number]>();
  const source = (ref: unknown, supported: string, title?: string, accessed?: string) => {
    const original = cellText(ref);
    const id = `${cid}--${original && !urlsOnly(original) ? original : key("url", original)}`;
    if (!sourceMap.has(id)) {
      sourceMap.set(id, {
        id,
        publisher: manifest.country,
        title: title || (urlsOnly(original) ? original : `Source reference ${original || "not supplied"}`),
        url: urlsOnly(original),
        datesLabel: accessed ?? "",
        fileHash: null,
        locator: null,
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
  for (const row of [...masterSources, ...companionSources]) {
    const sid = cellText(row["Source ID"]);
    if (!sid) continue;
    source(
      sid,
      cid,
      cellText(row["Title"] || row["Title / dataset"]),
      cellText(row["Accessed"]),
    );
    const created = sourceMap.get(`${cid}--${sid}`);
    if (created) {
      created.url = urlsOnly(row["Source URL"] || row["URL"]);
      created.publisher = cellText(row["Evidence grade"]) || manifest.country;
    }
  }

  const officeIds = new Set<string>();
  const calendarStatus = calendar.map((row) => cellText(row["Date status"])).join(" ");
  for (const row of offices) {
    const oid = cellText(row["Office ID"]);
    if (!oid || officeIds.has(oid)) {
      throw new Error(`Armenia office identity error: ${oid}`);
    }
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
    const companionForOffice = companionHistories.filter(
      (h) => cellText(h["Jurisdiction ID"]) === oid,
    );
    // History-index rows overlap companion histories. Do not add them together.
    const selected =
      companionForOffice.length > 0
        ? companionForOffice
        : indexHistories.filter((h) => cellText(h["Office ID"]) === oid);
    const selectedKeys = [
      ...new Set(
        selected.map((h) =>
          historyKey(
            oid,
            h["Year"],
            h["Actual ballot date, if recorded"] ?? h["Ballot date if recorded"],
          ),
        ),
      ),
    ];
    const nextLabel = cellText(row["Next polling date"]);
    const nextId = nextLabel ? key("next", oid) : null;
    const src = cellText(row["Calendar evidence"])
      ? [source(row["Calendar evidence"], oid)]
      : [];
    d.offices.push({
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
      ...(nextId
        ? {
            nextElection: {
              date: dateValue(nextLabel, nextDateCertainty(calendarStatus)),
              eventId: nextId,
            },
          }
        : {}),
      selectedHistoryKeys: selectedKeys,
      allHistoryKeys: selectedKeys,
      structuralLimitation: cellText(row["Historical coverage"]) || undefined,
      sourceIds: src,
      extensions: {
        raw: {
          note: cellText(row["Historical coverage"]),
          originalPackage: "data/countries/armenia",
          packed: true,
        },
      },
    });
    if (nextId) {
      d.events.push({
        id: nextId,
        officeId: oid,
        countryId: cid,
        historyKey: nextId,
        date: dateValue(nextLabel, nextDateCertainty(calendarStatus)),
        kind: "unknown",
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
    d.metrics.push({
      id: key("ci", oid),
      officeId: oid,
      kind: "competition_index",
      value: { status: "unknown", value: null },
      unit: "0–100 historical closeness",
      methodVersion: "ci.weighted-gap.v1",
      inputs: { latest_gap: null, previous_gap: null, oldest_gap: null },
      selectedCycleKeys: selectedKeys,
      eligibility: cellText(row["Historical competition screen"]),
      reviewStatus: "withheld",
      scoreGate: false,
      withholdingReason:
        cellText(row["Historical competition screen"]) ||
        "Comparable three-cycle sequence unavailable",
      comparisonStatus: cellText(row["Historical coverage"]),
    });
  }

  const resultGroups = new Map<string, TableRow[]>();
  for (const row of companionResults) {
    const oid = cellText(row["Jurisdiction ID"]);
    const hk = historyKey(
      oid,
      row["Year"],
      row["Actual ballot date, if recorded"],
    );
    const list = resultGroups.get(hk) ?? [];
    list.push(row);
    resultGroups.set(hk, list);
  }

  const seen = new Set<string>();
  const emitHistory = (
    oid: string,
    year: unknown,
    ballot: unknown,
    raw: Record<string, unknown>,
    voteBasis: unknown,
    coverageText: string,
    url: string,
  ) => {
    const hk = historyKey(oid, year, ballot);
    if (seen.has(hk) || !officeIds.has(oid)) return;
    seen.add(hk);
    const id = key("event", [cid, hk]);
    const rows = resultGroups.get(hk) ?? [];
    d.events.push({
      id,
      officeId: oid,
      countryId: cid,
      historyKey: hk,
      date: dateValue(cellText(ballot) || cellYear(year)),
      kind: eventKind(coverageText),
      selectedHistoryRole: "selected",
      electoralSystem: cellText(voteBasis),
      comparability: coverageText,
      ballotBasis: ballotBasisOf(voteBasis),
      voteShareUnit: "percent_0_100",
      legalOutcome: legalOutcome({ coverage: coverageText }),
      proceedingIds: [],
      resultRows: rows.map((p, i) => ({
        id: `${id}-r${i}`,
        label:
          cellText(p["Party / list"]) ||
          cellText(p["Candidate / ticket"]) ||
          "Unlabelled source row",
        candidate: cellText(p["Candidate / ticket"]) || null,
        partyCode: cellText(p["Party / list"]),
        partyNamespace: `${cid}/${cellYear(p["Year"]) ?? "unknown"}`,
        votes: numberValue(p["Votes"]),
        share: numberValue(p["Share"]),
        shareUnit: "percent_0_100" as const,
        seats: numberValue(p["Seats"]),
        electedFlag: null,
        isSubstitute: false,
        evidenceStatus: /preliminary|provisional/i.test(cellText(p["Vote basis"]))
          ? ("preliminary" as const)
          : ("recorded" as const),
        extensions: { raw: p },
      })),
      sourceIds: url ? [source(url, id)] : [],
      extensions: { raw },
    });
  };

  const officesWithCompanion = new Set(
    companionHistories
      .map((row) => cellText(row["Jurisdiction ID"]))
      .filter(Boolean),
  );
  for (const row of companionHistories) {
    emitHistory(
      cellText(row["Jurisdiction ID"]),
      row["Year"],
      row["Actual ballot date, if recorded"],
      row,
      row["Round / basis"] || row["Vote basis"],
      cellText(row["Coverage"]),
      cellText(row["Result source URL"]),
    );
  }
  for (const row of indexHistories) {
    const oid = cellText(row["Office ID"]);
    if (officesWithCompanion.has(oid)) continue;
    emitHistory(
      oid,
      row["Year"],
      row["Ballot date if recorded"],
      row,
      row["Vote basis"],
      [cellText(row["Coverage"]), cellText(row["Comparability status"])]
        .filter(Boolean)
        .join(" · "),
      cellText(row["Source URL"]),
    );
  }

  const remaining = coverage.remaining || cellText(notes?.["Scope and remaining gaps"]);
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

  const briefingCount = [...files.keys()].filter((name) =>
    /^Office_Briefings\/Offices\/.+\.html$/.test(name),
  ).length;
  d.sources = [...sourceMap.values()].map((s) => ({
    ...s,
    supportedRecordIds: s.supportedRecordIds.sort(),
  }));
  recomputeCounts(d);
  d.release.validatedCounts.briefings = briefingCount;
  return d;
}

export function armeniaBriefingFiles(dir: string): Map<string, string> {
  const files = unpackArmeniaPayload(dir);
  const out = new Map<string, string>();
  for (const [name, bytes] of files) {
    const match = name.match(/^Office_Briefings\/Offices\/(.+)\.html$/);
    if (match) out.set(match[1]!, bytes.toString("utf8"));
  }
  return out;
}

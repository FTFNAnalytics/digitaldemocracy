/* eslint-disable @typescript-eslint/no-explicit-any -- validated legacy boundary */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { unzipSync } from "fflate";
import sanitizeHtml from "sanitize-html";
import { classifyRelativePath } from "./classify";
import {
  normalizeCountry,
  emptyDataset,
  digest,
  stable,
  slug,
  key,
  text,
  regionFor,
  isCountryDocument,
  issueCategory,
  type Raw,
} from "./normalize";
import type {
  NormalizedDataset,
  DatasetRelease,
} from "../../schemas/v1/normalized";
import { validateDataset } from "../validate/dataset";

export function csvRows(input: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [],
    v = "",
    quoted = false;
  const s = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') {
      if (quoted && s[i + 1] === '"') {
        v += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(v);
      v = "";
    } else if (c === "\n" && !quoted) {
      row.push(v.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      v = "";
    } else v += c;
  }
  if (quoted) throw new Error("Unterminated CSV field");
  if (v || row.length) {
    row.push(v);
    rows.push(row);
  }
  const header = rows.shift() || [];
  return rows
    .filter((r) => r.some(Boolean))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] || ""])));
}
export function cleanBriefing(
  html: string,
  links: Map<string, string>,
): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "details",
      "summary",
      "section",
      "article",
    ]),
    allowedAttributes: {
      a: ["href", "rel"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      "*": ["id"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: (_tag, attrs) => {
        let href = attrs.href || "";
        const tail = href.split("/").pop() || "";
        if (links.has(tail))
          href = `/electiondatabase/offices/${encodeURIComponent(links.get(tail)!)}`;
        else if (
          href === "Start_Here.html" ||
          href.endsWith("/Start_Here.html")
        )
          href = "/electiondatabase";
        else if (href.endsWith("Methodology.html"))
          href = "/electiondatabase/methodology";
        else if (!/^https?:\/\//i.test(href) && !href.startsWith("#"))
          href = "";
        return { tagName: "a", attribs: { href, rel: "noreferrer noopener" } };
      },
    },
  });
}
export function importRelease(zipPath: string, root = process.cwd()) {
  const start = Date.now();
  const bytes = readFileSync(zipPath);
  const packageSha = digest(bytes);
  const entries = unzipSync(bytes);
  const names = Object.keys(entries).sort();
  for (const n of names)
    if (n.startsWith("/") || n.split(/[\\/]/).includes(".."))
      throw new Error(`Unsafe ZIP entry ${n}`);
  const json = (n: string) =>
    entries[n] ? JSON.parse(Buffer.from(entries[n]).toString("utf8")) : null;
  const status = json("Data/Build_Status.json");
  if (!status?.window_start || !status?.window_end)
    throw new Error("Required release window missing");
  const release: DatasetRelease = {
    id: `latin-america-${packageSha.slice(0, 12)}`,
    schemaVersion: "1.1.0",
    methodVersion: "legacy-reviewed-input-v1",
    provenance: {
      kind: "latin_america_release",
      packageName: path.basename(zipPath),
      notes: `Immutable input SHA-256 ${packageSha}. Display normalization does not certify unresolved research.`,
    },
    window: {
      startLabel: status.window_start,
      endLabel: status.window_end,
      inclusive: true,
      source: "imported_release",
    },
    snapshotLabel: status.snapshot,
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
  const base = emptyDataset(release);
  base.artifacts.push({
    id: key("artifact", path.basename(zipPath)),
    officeId: null,
    releaseId: release.id,
    format: "zip",
    path: null,
    checksum: packageSha,
    available: false,
    bytes: bytes.length,
    originalPath: path.basename(zipPath),
    notes: "Original complete research archive; requires an artifact host.",
  });
  base.regions = [
    ["south-america", "South America"],
    ["central-america", "Central America"],
    ["caribbean", "Caribbean"],
    ["north-america", "North America"],
    ["europe", "Europe (Russia excluded)"],
    ["australia", "Australia"],
    ["new-zealand", "New Zealand"],
    ["japan", "Japan"],
  ].map(([id, name]) => ({
    id,
    name,
    status: ["europe", "australia", "new-zealand", "japan"].includes(id)
      ? "not_supplied"
      : "partial",
    isDefaultLanding: id === "south-america",
    notes:
      id === "south-america"
        ? "Research is available with explicit remaining evidence gaps."
        : "Coverage refers only to this imported release; other project datasets are not yet integrated.",
  }));
  const target = path.join(root, "data/research");
  const staging = target + ".staging";
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  mkdirSync(path.join(staging, "objects"));
  const writeGz = (file: string, obj: any) => {
    const p = path.join(staging, file);
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(
      p,
      gzipSync(Buffer.from(typeof obj === "string" ? obj : stable(obj)), {
        level: 9,
      }),
    );
  };
  const countries: { file: string; data: NormalizedDataset }[] = [];
  const inventory: any[] = [];
  const countryDocs = new Map<string, Raw>();
  for (const name of names.filter((n) => /^Data\/[^/]+\.json$/.test(n))) {
    const doc = json(name);
    if (isCountryDocument(doc)) {
      if (countryDocs.has(doc.country))
        throw new Error("Duplicate country document");
      countryDocs.set(doc.country, doc);
    }
  }
  for (const [country, doc] of countryDocs) {
    const filename = names.find(
      (n) =>
        /^Data\/[^/]+\.json$/.test(n) &&
        n === `Data/${country.replaceAll(" ", "_")}.json`,
    );
    if (!filename) throw new Error(`Country filename unsupported: ${country}`);
    const supplement = json(
      filename.replace(".json", "_Supplementary_Evidence.json"),
    );
    countries.push({
      file: `countries/${slug(country)}.json.gz`,
      data: normalizeCountry(
        {
          ...doc,
          polling: [
            ...(doc.polling || []),
            ...(json("Data/polling_context.json") || []).filter(
              (p: Raw) => p.country === country,
            ),
          ],
        },
        release,
        Array.isArray(supplement) ? supplement : [],
      ),
    });
  }
  for (const country of new Set<string>(
    (json("Data/polling_context.json") || []).map((p: Raw) => p.country),
  )) {
    if (countryDocs.has(country)) continue;
    const context = normalizeCountry(
      {
        country,
        coverage: {},
        offices: [],
        histories: [],
        rosters: [],
        sources: [],
        polling: (json("Data/polling_context.json") || []).filter(
          (p: Raw) => p.country === country,
        ),
      },
      release,
    );
    base.polls.push(...context.polls);
    base.sources.push(...context.sources);
  }
  const officeMap = new Map(
    countries.flatMap(({ data }) =>
      data.offices.map((o) => [o.id, o] as const),
    ),
  );
  const fileToOffice = new Map<string, string>();
  for (const oid of officeMap.keys())
    fileToOffice.set(digest(oid).slice(0, 20) + ".html", oid);
  const briefingByCountry = new Map<string, Record<string, string>>();
  const legacyLinks: Record<string, string> = {};
  for (const name of names) {
    if (name.endsWith("/")) continue;
    const buffer = entries[name],
      sha = digest(buffer);
    let classification = classifyRelativePath(name);
    if (name.endsWith(".json") && isCountryDocument(json(name)))
      classification = {
        documentType: "country_record",
        adapter: "country-json",
      };
    const isBrief = /^Briefings\/[^/]+\/[^/]+\.html$/.test(name);
    let disposition = "ancillary_download";
    if (isBrief) {
      const oid = fileToOffice.get(path.basename(name));
      if (!oid) throw new Error(`Unmapped original briefing ${name}`);
      const html = Buffer.from(buffer).toString("utf8");
      if (!html.includes(oid))
        throw new Error(`Briefing identity mismatch ${name}`);
      const cid = officeMap.get(oid)!.countryId;
      const records = briefingByCountry.get(cid) || {};
      records[oid] = cleanBriefing(html, fileToOffice);
      briefingByCountry.set(cid, records);
      legacyLinks[name] = oid;
      disposition = "office_briefing";
    } else {
      const isText = /\.(json|csv|md|txt|html)$/i.test(name);
      const aid = key("artifact", name);
      const objectFile = `objects/${sha}.gz`;
      // Text evidence is versioned in compressed objects. Workbooks/PDFs use an optional external artifact base URL.
      if (isText)
        writeFileSync(
          path.join(staging, objectFile),
          gzipSync(buffer, { level: 9 }),
        );
      base.artifacts.push({
        id: aid,
        officeId: null,
        releaseId: release.id,
        format: path.extname(name).slice(1),
        path: isText ? `/electiondatabase/artifacts/${aid}` : null,
        checksum: sha,
        available: isText,
        bytes: buffer.length,
        originalPath: name,
        notes: isText
          ? name
          : `${name} — original binary artifact; available when an artifact host is configured.`,
      });
    }
    inventory.push({
      path: name,
      bytes: buffer.length,
      sha256: sha,
      documentType: classification.documentType,
      adapter: classification.adapter,
      disposition,
    });
  }
  if (Object.keys(legacyLinks).length !== officeMap.size)
    throw new Error("Every imported office must have its original briefing");
  for (const [cid, records] of briefingByCountry)
    writeGz(`briefings/${cid}.json.gz`, records);
  writeFileSync(
    path.join(staging, "legacy-links.json"),
    stable(legacyLinks) + "\n",
  );
  // The published country screen is a separate register, not an invented set of zero-result offices.
  const review = json("Data/south_america_release_review.json");
  const coverage = status.totals;
  const summary = json("release_summary.json");
  const screened = json("Data/Country_Screen_Evidence.json") || [];
  const countryCoverage = Array.isArray(summary?.coverage)
    ? summary.coverage
    : review?.country_coverage || [];
  for (const r of countryCoverage) {
    if (!r.country || countryDocs.has(r.country)) continue;
    const cid = slug(r.country);
    const screen = screened.find((s: Raw) => s.country === r.country);
    base.countries.push({
      id: cid,
      regionId: regionFor(r.country),
      names: { official: r.country, short: r.country, aliases: [] },
      kind: "sovereign_country",
      coverageStatus: "screened_out",
      notes: text(r.note || screen?.note || r.status),
      screening: {
        asOfLabel: status.snapshot,
        reason: text(r.status || screen?.status),
        exceptionalElectionQualification: text(r.note || screen?.note),
      },
      extensions: { raw: { screen, coverage: r } },
    });
  }
  for (const r of json("Data/South_America_Territories.json") || []) {
    base.countries.push({
      id: slug(r.territory),
      regionId: "south-america",
      names: { official: r.territory, short: r.territory, aliases: [] },
      kind: "territory",
      coverageStatus: "partial",
      notes: [r.scope, r.status, r.note].filter(Boolean).join(". "),
      screening: {
        asOfLabel: status.snapshot,
        reason: text(r.status),
        exceptionalElectionQualification: text(r.note),
      },
      extensions: { raw: r },
    });
  }
  const queue = entries["South_America_Completion_Queue.csv"]
    ? csvRows(
        Buffer.from(entries["South_America_Completion_Queue.csv"]).toString(
          "utf8",
        ),
      )
    : [];
  for (const r of queue) {
    const o = officeMap.get(r["Office ID"]);
    if (!o)
      throw new Error(`Unknown completion-queue office ${r["Office ID"]}`);
    const requirement = [
      r["Office-specific evidence requirement"],
      r["Country evidence requirement"],
    ]
      .filter(Boolean)
      .join(" ");
    base.completionQueue.push({
      id: key("queue", o.id),
      officeId: o.id,
      countryId: o.countryId,
      requirement,
      category: issueCategory(r["Office-specific evidence requirement"]),
    });
  }
  const aggregate = emptyDataset(release);
  for (const field of Object.keys(aggregate) as (keyof NormalizedDataset)[]) {
    if (field === "release") continue;
    (aggregate[field] as any[]) = [
      ...(base[field] as any[]),
      ...countries.flatMap((c) => c.data[field] as any[]),
    ];
  }
  release.validatedCounts = {
    currentOffices: aggregate.offices.filter((o) => o.status === "current")
      .length,
    historicalOffices: aggregate.offices.filter(
      (o) => o.status === "historical",
    ).length,
    histories: aggregate.events.filter((e) => e.selectedHistoryRole !== "none")
      .length,
    resultRows: aggregate.events.reduce((n, e) => n + e.resultRows.length, 0),
    briefings: Object.keys(legacyLinks).length,
    recomputedFromNormalizedRecords: true,
  };
  const expected = {
    currentOffices: coverage.tracked_current_units,
    historicalOffices: coverage.historical_predecessor_units,
    histories: coverage.histories,
    resultRows: coverage.party_rows,
  };
  for (const [k, v] of Object.entries(expected))
    if (release.validatedCounts[k as keyof typeof expected] !== v)
      throw new Error(`Release count mismatch: ${k}`);
  const validation = validateDataset(aggregate);
  if (validation.errors.length)
    throw new Error(validation.errors.slice(0, 15).join("\n"));
  const dates = aggregate.sources
    .map((s) => s.datesLabel.slice(0, 10))
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
    .sort();
  release.retrievalRangeLabel = dates.length
    ? `${dates[0]}–${dates.at(-1)}`
    : null;
  release.artifactRefs = base.artifacts.map((a) => a.id);
  for (const c of countries) writeGz(c.file, c.data);
  writeGz("base.json.gz", base);
  const previousManifestPath = path.join(target, "manifest.json");
  const prior = existsSync(previousManifestPath)
    ? JSON.parse(readFileSync(previousManifestPath, "utf8"))
    : null;
  const priorFiles = new Map<string, string>(
    (prior?.inventory || []).map((f: any) => [f.path, f.sha256]),
  );
  const currentNames = new Set(inventory.map((f) => f.path));
  const comparison =
    prior?.packageSha256 === packageSha
      ? prior.comparison || {
          previousRelease: null,
          added: [],
          changed: [],
          removed: [],
        }
      : {
          previousRelease: prior?.release?.id || null,
          added: prior
            ? inventory
                .filter((f) => !priorFiles.has(f.path))
                .map((f) => f.path)
            : [],
          changed: prior
            ? inventory
                .filter(
                  (f) =>
                    priorFiles.has(f.path) &&
                    priorFiles.get(f.path) !== f.sha256,
                )
                .map((f) => f.path)
            : [],
          removed: prior
            ? [...priorFiles.keys()].filter((p) => !currentNames.has(p))
            : [],
        };
  const manifest = {
    schemaVersion: "1.1.0",
    release,
    packageSha256: packageSha,
    countryFiles: countries.map((c) => ({
      path: c.file,
      sha256: digest(readFileSync(path.join(staging, c.file))),
    })),
    baseSha256: digest(readFileSync(path.join(staging, "base.json.gz"))),
    inventory,
    comparison,
    briefingFiles: [...briefingByCountry.keys()]
      .sort()
      .map((cid) => ({
        path: `briefings/${cid}.json.gz`,
        sha256: digest(
          readFileSync(path.join(staging, `briefings/${cid}.json.gz`)),
        ),
      })),
    legacyLinksSha256: digest(
      readFileSync(path.join(staging, "legacy-links.json")),
    ),
    validation,
    legacyDefects: [
      {
        file: "release_summary.json",
        field: "totals",
        handling: "Not used; recomputed from validated records",
      },
      {
        file: "Data/Build_Status.json",
        field: "briefings",
        reported: status.briefings,
        recomputed: release.validatedCounts.briefings,
      },
    ],
    researchCoverageComplete: false,
  };
  writeFileSync(
    path.join(staging, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  // Only publish a validated staging directory. Preserve the previous release for a local recovery.
  const previous = target + ".previous";
  rmSync(previous, { recursive: true, force: true });
  if (existsSync(target)) renameSync(target, previous);
  renameSync(staging, target);
  console.log(
    JSON.stringify(
      {
        release: release.id,
        counts: release.validatedCounts,
        countries: aggregate.countries.length,
        validation,
        seconds: (Date.now() - start) / 1000,
        peakRssMiB: Math.round(process.resourceUsage().maxRSS / 1024),
      },
      null,
      2,
    ),
  );
  return manifest;
}

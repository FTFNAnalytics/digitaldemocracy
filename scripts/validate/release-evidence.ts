/* eslint-disable @typescript-eslint/no-explicit-any -- compare preserved heterogeneous source records */
import { readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { loadResearch } from "../../lib/observatory/research";
// Independent comparison against original country documents preserved byte-for-byte.
// This validates preservation, not the accuracy or completeness of the underlying research.
const root = path.join(process.cwd(), "data/research");
const manifest = JSON.parse(
  readFileSync(path.join(root, "manifest.json"), "utf8"),
);
const d = loadResearch();
const offices = new Map(d.offices.map((o) => [o.id, o]));
const histories = new Map(
  d.events
    .filter((e) => e.selectedHistoryRole !== "none")
    .map((e) => [e.historyKey, e]),
);
let countryCount = 0,
  officeCount = 0,
  historyCount = 0,
  rowCount = 0,
  objectCount = 0;
for (const a of d.artifacts.filter((a) => a.available)) {
  const bytes = gunzipSync(
    readFileSync(path.join(root, "objects", a.checksum + ".gz")),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    a.checksum,
    a.originalPath,
  );
  assert.equal(bytes.length, a.bytes);
  objectCount++;
  if (!/^Data\/[^/]+\.json$/.test(a.originalPath || "")) continue;
  const raw = JSON.parse(bytes.toString("utf8"));
  if (
    !raw.country ||
    !Array.isArray(raw.offices) ||
    !Array.isArray(raw.histories)
  )
    continue;
  countryCount++;
  for (const o of raw.offices) {
    const normalized = offices.get(o.id)!;
    assert.ok(normalized);
    assert.deepEqual(normalized.selectedHistoryKeys, o.selected_keys);
    assert.deepEqual(normalized.allHistoryKeys, o.all_keys);
    assert.equal(normalized.status, o.current ? "current" : "historical");
    if (o.current && o.date)
      assert.equal(normalized.nextElection?.date.label, String(o.date));
    officeCount++;
  }
  for (const h of raw.histories) {
    const e = histories.get(h._key)!;
    assert.ok(e);
    assert.equal(e.officeId, h.jurisdiction_id);
    assert.equal(e.resultRows.length, h.parties.length);
    historyCount++;
    h.parties.forEach((p: any, i: number) => {
      const r = e.resultRows[i];
      assert.deepEqual(r.extensions?.raw, p);
      assert.equal(r.votes.value, typeof p.votes === "number" ? p.votes : null);
      assert.equal(r.seats.value, typeof p.seats === "number" ? p.seats : null);
      assert.equal(r.share.value, p.reported_share ?? p.share ?? null);
      if (p.votes === 0) assert.equal(r.votes.status, "zero");
      rowCount++;
    });
  }
}
assert.equal(
  officeCount,
  d.release.validatedCounts.currentOffices +
    d.release.validatedCounts.historicalOffices,
);
assert.equal(historyCount, d.release.validatedCounts.histories);
assert.equal(rowCount, d.release.validatedCounts.resultRows);
assert.equal(countryCount, manifest.countryFiles.length);
const pollArtifact = d.artifacts.find(
  (a) => a.originalPath === "Data/polling_context.json",
)!;
const sharedPolls = JSON.parse(
  gunzipSync(
    readFileSync(path.join(root, "objects", pollArtifact.checksum + ".gz")),
  ).toString("utf8"),
);
for (const p of sharedPolls)
  assert.ok(
    d.polls.some(
      (row) =>
        JSON.stringify(row.extensions?.raw) === JSON.stringify(p) ||
        JSON.stringify(Object.entries(row.extensions?.raw || {}).sort()) ===
          JSON.stringify(Object.entries(p).sort()),
    ),
    `Missing shared poll ${p.country}/${p.fieldwork_start}`,
  );
for (const f of manifest.briefingFiles)
  assert.equal(
    createHash("sha256")
      .update(readFileSync(path.join(root, f.path)))
      .digest("hex"),
    f.sha256,
  );
assert.equal(
  createHash("sha256")
    .update(readFileSync(path.join(root, "legacy-links.json")))
    .digest("hex"),
  manifest.legacyLinksSha256,
);
const links = JSON.parse(
  readFileSync(path.join(root, "legacy-links.json"), "utf8"),
);
assert.equal(Object.keys(links).length, officeCount);
for (const [country, rows] of Map.groupBy(d.offices, (o) => o.countryId)) {
  const briefings = JSON.parse(
    gunzipSync(
      readFileSync(path.join(root, "briefings", country + ".json.gz")),
    ).toString("utf8"),
  );
  for (const office of rows) {
    assert.ok(briefings[office.id]);
    assert.ok(!/<script\b/i.test(briefings[office.id]));
  }
}
assert.equal(
  manifest.inventory.filter((f: any) => f.documentType === "country_record")
    .length,
  manifest.countryFiles.length,
);
console.log(
  JSON.stringify(
    {
      countryCount,
      officeCount,
      historyCount,
      rowCount,
      verifiedSourceObjects: objectCount,
      linkedBriefings: Object.keys(links).length,
      errors: [],
    },
    null,
    2,
  ),
);

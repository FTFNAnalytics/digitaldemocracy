import type { NormalizedDataset } from "../../schemas/v1/normalized";
import { competitionIndex } from "../../lib/observatory/metrics";

export function validateDataset(d: NormalizedDataset) {
  const errors: string[] = [];
  let checks = 0;
  const check = (ok: boolean, message: string) => {
    checks++;
    if (!ok) errors.push(message);
  };
  for (const [name, rows] of Object.entries(d)) {
    if (!Array.isArray(rows)) continue;
    const ids = rows.map((r) => r.id);
    check(new Set(ids).size === ids.length, `Duplicate ${name} identities`);
  }
  const offices = new Map(d.offices.map((o) => [o.id, o]));
  const events = new Map(d.events.map((e) => [e.id, e]));
  const sources = new Set(d.sources.map((s) => s.id));
  const countries = new Set(d.countries.map((c) => c.id));
  const geographies = new Set(d.geographies.map((g) => g.id));
  const histories = new Map(
    d.events
      .filter((e) => e.selectedHistoryRole !== "none")
      .map((e) => [e.historyKey, e]),
  );
  for (const o of d.offices) {
    check(
      countries.has(o.countryId) && geographies.has(o.geographyId),
      `Office geography ${o.id}`,
    );
    for (const k of o.allHistoryKeys)
      check(histories.get(k)?.officeId === o.id, `History link ${o.id}/${k}`);
    for (const k of o.selectedHistoryKeys)
      check(
        histories.get(k)?.selectedHistoryRole === "selected",
        `Selected history ${k}`,
      );
    if (o.nextElection?.eventId)
      check(
        events.get(o.nextElection.eventId)?.officeId === o.id,
        `Upcoming event ${o.id}`,
      );
  }
  for (const e of d.events) {
    check(offices.has(e.officeId), `Event office ${e.id}`);
    if (e.date.precision === "month")
      check(e.date.day == null, `Invented day ${e.id}`);
    if (e.selectedHistoryRole === "none")
      check(
        e.resultRows.length === 0 && e.legalOutcome === "not_held",
        `Upcoming event has result ${e.id}`,
      );
    for (const r of e.resultRows)
      for (const n of [r.votes, r.share, r.seats])
        check(
          n.value == null || Number.isFinite(n.value),
          `Invalid number ${r.id}`,
        );
  }
  for (const m of d.metrics) {
    check(offices.has(m.officeId), `Metric office ${m.id}`);
    if (m.reviewStatus === "cleared") {
      check(
        m.scoreGate === true && m.kind === "competition_index",
        `Uncleared metric ${m.id}`,
      );
      const gaps = [
        m.inputs.latest_gap,
        m.inputs.previous_gap,
        m.inputs.oldest_gap,
      ];
      check(
        gaps.every((v) => typeof v === "number") &&
          m.value.value != null &&
          Math.abs(
            m.value.value - competitionIndex(gaps as [number, number, number]),
          ) < 1e-8,
        `CI formula ${m.id}`,
      );
    }
  }
  for (const p of d.polls) {
    check(countries.has(p.countryId), `Poll country ${p.id}`);
    if (p.officeId) check(offices.has(p.officeId), `Poll office ${p.id}`);
    if (p.scope === "national")
      check(!p.supportsLocalConclusion, `National forecast ${p.id}`);
  }
  for (const rows of [
    d.offices,
    d.events,
    d.officeholders,
    d.registers,
    d.polls,
    d.issues,
  ])
    for (const r of rows)
      for (const sid of r.sourceIds)
        check(sources.has(sid), `Missing source ${sid}`);
  for (const r of [...d.officeholders, ...d.registers, ...d.completionQueue])
    if (r.officeId)
      check(offices.has(r.officeId), `Observation office ${r.id}`);
  const counts = d.release.validatedCounts;
  check(
    d.offices.filter((o) => o.status === "current").length ===
      counts.currentOffices,
    "Current count",
  );
  check(
    d.offices.filter((o) => o.status === "historical").length ===
      counts.historicalOffices,
    "Historical count",
  );
  check(
    d.events.filter((e) => e.selectedHistoryRole !== "none").length ===
      counts.histories,
    "History count",
  );
  check(
    d.events.reduce((n, e) => n + e.resultRows.length, 0) === counts.resultRows,
    "Result count",
  );
  return { checks, errors };
}

export function validate(data) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const validDate = value => typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  const unique = (rows, label) => {
    const ids = rows.map(row => row.id);
    check(ids.every(id => typeof id === "string" && id.startsWith("NZ-")), label + ": invalid ID");
    check(new Set(ids).size === ids.length, label + ": duplicate ID");
    return new Set(ids);
  };
  check(data.schema_version === "nz-research-batch/1", "Unsupported schema");
  check(data.country_code === "NZ" && data.region === "Oceania", "Country/region mismatch");
  check(validDate(data.snapshot_date), "Invalid snapshot");
  check(validDate(data.research_window.start) && validDate(data.research_window.end), "Invalid window");
  check(data.research_window.start <= data.research_window.end, "Reversed window");
  const sources = unique(data.sources, "sources");
  const races = unique(data.races, "races");
  unique(data.histories, "histories");
  unique([...data.races.flatMap(r => r.candidates), ...data.histories.flatMap(h => h.results)], "candidate rows");
  const refs = (row, label) => check(Array.isArray(row.source_ids) && row.source_ids.length > 0 &&
    row.source_ids.every(id => sources.has(id)), label + ": missing source reference");
  for (const s of data.sources) {
    check(/^https:\/\//.test(s.url), s.id + ": invalid URL");
    check(validDate(s.checked_on) && s.checked_on <= data.snapshot_date, s.id + ": invalid check date");
    check(Boolean(s.publisher && s.title && s.review_status && s.notes), s.id + ": missing provenance");
  }
  const withheld = row => {
    check(row.metrics.status === "withheld" && Boolean(row.metrics.reason), row.id + ": missing metric gate");
    check(row.metrics.competitiveness_index === null && row.metrics.pedersen_volatility === null,
      row.id + ": unsupported metric published");
  };
  for (const r of data.races) {
    refs(r, r.id);
    check(r.country_code === "NZ" && r.election_type === "by_election", r.id + ": unexpected scope");
    check(validDate(r.election_date) && r.election_date >= data.research_window.start &&
      r.election_date <= data.research_window.end, r.id + ": election outside research window");
    check(r.election_date > data.snapshot_date, r.id + ": snapshot is no longer prospective");
    check(Number.isInteger(r.seats_to_fill) && r.seats_to_fill > 0, r.id + ": invalid seats");
    check(r.time_zone === "Pacific/Auckland", r.id + ": timezone missing");
    check(r.close_time_local === null || /^\d{2}:\d{2}$/.test(r.close_time_local), r.id + ": invalid closing time");
    check(["FPP", "STV"].includes(r.electoral_system), r.id + ": unsupported system");
    check(r.vacancy.current_holder === null && r.vacancy.status === "vacant", r.id + ": vacancy conflated with incumbent");
    for (const field of ["nominations_open", "nominations_close", "voting_documents_from"]) {
      if (r[field]) check(validDate(r[field]) && r[field] <= r.election_date, r.id + ": invalid " + field);
    }
    if (r.nominations_open && r.nominations_close) check(r.nominations_open <= r.nominations_close, r.id + ": reversed nominations");
    if (r.candidate_roster_status.startsWith("complete")) check(r.candidates.length > r.seats_to_fill, r.id + ": incomplete contested roster");
    for (const c of r.candidates) {
      refs(c, c.id);
      check(Boolean(c.name), c.id + ": missing name");
      check(c.votes === null && c.elected === null, c.id + ": future result invented");
    }
    withheld(r);
  }
  for (const h of data.histories) {
    refs(h, h.id);
    check(races.has(h.related_race_id), h.id + ": orphan history");
    check(validDate(h.election_date) && h.election_date < data.snapshot_date, h.id + ": invalid historical date");
    check(validDate(h.declaration_date) && h.declaration_date >= h.election_date &&
      h.declaration_date <= data.snapshot_date, h.id + ": invalid declaration date");
    check(h.results.length >= h.seats && h.candidate_table_complete === true, h.id + ": incomplete table");
    check(h.results.filter(r => r.elected).length === h.seats, h.id + ": elected count differs from seats");
    check(h.electoral_system === "FPP" && h.vote_unit === "candidate_marks" && h.ballot_total === null,
      h.id + ": candidate marks misrepresented as ballots");
    check(Number.isInteger(h.informal_papers) && h.informal_papers >= 0 &&
      Number.isInteger(h.blank_papers) && h.blank_papers >= 0, h.id + ": invalid paper counts");
    for (const r of h.results) {
      check(Boolean(r.name) && Number.isInteger(r.votes) && r.votes >= 0 &&
        typeof r.elected === "boolean", r.id + ": invalid return");
      check(r.vote_share === null, r.id + ": unsupported vote share");
    }
    const winnerMin = Math.min(...h.results.filter(r => r.elected).map(r => r.votes));
    const loserMax = Math.max(...h.results.filter(r => !r.elected).map(r => r.votes));
    check(winnerMin >= loserMax, h.id + ": FPP elected flag contradicts marks");
    if (h.source_ids.includes("NZ-S03")) check(h.evidence_status === "provisional_legacy_mirror", h.id + ": legacy evidence promoted");
    withheld(h);
  }
  const coverage = data.coverage;
  check(coverage.upcoming_races === data.races.length, "Race count mismatch");
  check(coverage.candidate_rows === data.races.reduce((n, r) => n + r.candidates.length, 0), "Candidate count mismatch");
  check(coverage.historical_events === data.histories.length, "History count mismatch");
  check(coverage.historical_candidate_rows === data.histories.reduce((n, h) => n + h.results.length, 0), "Return count mismatch");
  check(coverage.official_final_historical_events === data.histories.filter(h => h.evidence_status === "official_final_table_reviewed").length, "Official history count mismatch");
  check(coverage.provisional_historical_events === data.histories.filter(h => h.evidence_status === "provisional_legacy_mirror").length, "Provisional count mismatch");
  check(coverage.national_screen_complete === false && coverage.latest_three_history_complete === false, "Coverage overstated");
  check(data.site_ingestion_status === "pending_adapter", "Unsupported ingestion claim");
  for (const g of data.research_gaps) check(g.race_id === null || races.has(g.race_id), "Orphan research gap");
  return errors;
}

if (typeof process !== "undefined" && process.argv[1]) {
  const { pathToFileURL } = await import("node:url");
  if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const { readFile } = await import("node:fs/promises");
    const data = JSON.parse(await readFile(new URL("./dataset.json", import.meta.url), "utf8"));
    const errors = validate(data);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    } else {
      console.log("New Zealand batch valid: " + data.races.length + " races, " +
        data.coverage.candidate_rows + " candidates, " + data.histories.length +
        " histories, " + data.coverage.historical_candidate_rows + " historical rows.");
    }
  }
}

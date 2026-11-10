/** Public wording when a country register is loaded and events or results are not. */

export const RESULTS_COMING_SOON = "offices register; results coming soon";
export const RESULTS_NOT_YET_INGESTED = "not yet ingested";

export function resultsComingSoonTitle(name: string): string {
  return `${name} — ${RESULTS_COMING_SOON}`;
}

/** Marker and tooltip text. A positive count stays a count. Zero is not "no elections". */
export function markerResultTitle(name: string, resultRows: number): string {
  if (resultRows > 0) return `${name}, ${resultRows} result rows`;
  return resultsComingSoonTitle(name);
}

export function resultsComingSoonDescription(name: string, officesLabel: string | null): string {
  const offices = officesLabel ? ` ${officesLabel} offices are on file.` : "";
  return `${resultsComingSoonTitle(name)}.${offices} Election events and result rows are not yet ingested.`;
}

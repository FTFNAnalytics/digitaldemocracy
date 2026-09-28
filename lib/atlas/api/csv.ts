/** CSV for Atlas exports. An empty cell means the source did not supply a value. */

export function csvCell(value: string | number | boolean | null | undefined): string {
  if (value == null) return "";
  const text = typeof value === "boolean" ? (value ? "true" : "false") : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function toCsv(
  header: readonly string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
): string {
  const lines = [header.join(",")];
  for (const row of rows) {
    if (row.length !== header.length) {
      throw new Error(`CSV row has ${row.length} cells; header has ${header.length}`);
    }
    lines.push(row.map(csvCell).join(","));
  }
  return `${lines.join("\n")}\n`;
}

/** Pipe-joined, sorted, de-duplicated. Empty string when no ids were supplied. */
export function joinIds(ids: Array<string | null | undefined> | undefined): string {
  return [...new Set((ids ?? []).filter((id): id is string => Boolean(id && id.trim())))].sort().join("|");
}

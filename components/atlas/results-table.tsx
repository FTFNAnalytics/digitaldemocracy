import { missingOrStatus, shareLabel, statusPhrase } from "./labels";
import type { ResultBarRow } from "./types";

function barScale(rows: ResultBarRow[]): number | null {
  const elected = rows.filter((row) => row.elected && row.share != null && row.share > 0);
  const pool = elected.length > 0 ? elected : rows.filter((row) => row.share != null && row.share > 0);
  if (pool.length === 0) return null;
  return Math.max(...pool.map((row) => row.share as number));
}

function runnerUpShare(rows: ResultBarRow[]): number | null {
  const shares = rows
    .filter((row) => !row.elected && row.share != null)
    .map((row) => row.share as number);
  if (shares.length === 0) return null;
  return Math.max(...shares);
}

function barTone(row: ResultBarRow, runnerUp: number | null): "accent" | "runner-up" | "other" | "none" {
  if (row.share == null) return "none";
  if (row.elected) return "accent";
  if (runnerUp != null && row.share === runnerUp) return "runner-up";
  return "other";
}

const BAR_CLASS = {
  accent: "bg-atlas-accent",
  "runner-up": "bg-atlas-bar-2",
  other: "bg-atlas-bar-3",
  none: "bg-transparent",
} as const;

export function ResultsTable({
  caption,
  rows,
  shareUnit,
}: {
  caption: string;
  rows: ResultBarRow[];
  shareUnit?: string | null;
}) {
  if (rows.length === 0) return null;
  const scale = barScale(rows);
  const runnerUp = runnerUpShare(rows);

  return (
    <div className="overflow-x-auto rounded-2xl border border-atlas-line bg-atlas-card">
      <table className="w-full min-w-[40rem] border-collapse text-sm text-atlas-ink">
        <caption className="px-3 py-3 text-left text-sm font-semibold text-atlas-ink">{caption}</caption>
        <thead>
          <tr className="border-b border-atlas-line text-left">
            {["Candidate or list", "Party", "Votes", "Share", "Seats", "Evidence"].map((column) => (
              <th key={column} scope="col" className="px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const tone = barTone(row, runnerUp);
            const width = scale != null && row.share != null && scale > 0 ? Math.max(0, Math.min(100, (row.share / scale) * 100)) : 0;
            return (
              <tr key={row.id} className="border-b border-atlas-line align-top last:border-0">
                <td className="px-3 py-2.5">
                  <div className="font-medium">{row.label ?? "not supplied"}</div>
                  {row.elected ? (
                    <span className="mt-1 inline-flex rounded-full bg-atlas-accent px-2 py-0.5 text-xs font-semibold text-atlas-on-accent">
                      Elected
                    </span>
                  ) : null}
                  {tone !== "none" ? (
                    <div className="mt-2 h-2 rounded-full bg-atlas-map-none" aria-hidden="true">
                      <div
                        data-atlas-bar={tone}
                        className={`h-2 rounded-full ${BAR_CLASS[tone]}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2.5">{row.partyLabel ?? "not supplied"}</td>
                <td className="px-3 py-2.5">{missingOrStatus(row.votes, row.votesStatus)}</td>
                <td className="px-3 py-2.5">{shareLabel(row.share, row.shareStatus, shareUnit)}</td>
                <td className="px-3 py-2.5">{missingOrStatus(row.seats, row.seatsStatus)}</td>
                <td className="px-3 py-2.5">{statusPhrase(row.evidenceStatus)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import type { HistoryDisplayRow } from "@/lib/atlas/seat/history";

export function SeatHistoryTable({ rows }: { rows: HistoryDisplayRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-atlas-line bg-atlas-card">
      <table className="w-full min-w-[48rem] border-collapse text-sm text-atlas-ink">
        <caption className="px-3 py-3 text-left text-sm font-semibold text-atlas-ink">Results by election cycle</caption>
        <thead>
          <tr className="border-b border-atlas-line text-left">
            {["Cycle", "Winner", "Party", "Votes", "Share", "Margin", "Turnout"].map((column) => (
              <th key={column} scope="col" className="px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.eventId} data-history-row={row.eventId} className="border-b border-atlas-line align-top last:border-0">
              <td className="px-3 py-2.5">
                <div>{row.cycle}</div>
                {row.proceedings.length > 0 ? (
                  <ol className="mt-3 space-y-2" data-proceedings={row.eventId}>
                    {row.proceedings.map((proceeding) => (
                      <li
                        key={proceeding.id}
                        data-proceeding={proceeding.id}
                        data-legal-outcome={proceeding.legalOutcomeLabel}
                        className={proceeding.superseded ? "line-through" : undefined}
                      >
                        <span>
                          {proceeding.kindLabel} · {proceeding.legalOutcomeLabel}
                        </span>
                        {proceeding.results.length > 0 ? (
                          <ul className="mt-1 space-y-1 pl-4 font-normal">
                            {proceeding.results.map((result) => (
                              <li
                                key={result.id}
                                data-result-row={result.id}
                                className={result.struck ? "line-through" : undefined}
                              >
                                {result.label} · {result.party} · {result.votes} · {result.share}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </td>
              <td className="px-3 py-2.5">{row.winner}</td>
              <td className="px-3 py-2.5">{row.party}</td>
              <td className="px-3 py-2.5">{row.votes}</td>
              <td className="px-3 py-2.5">{row.share}</td>
              <td className="px-3 py-2.5">{row.margin}</td>
              <td className="px-3 py-2.5">{row.turnout}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

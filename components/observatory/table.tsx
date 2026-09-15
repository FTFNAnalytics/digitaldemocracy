import { cn } from "@/lib/cn";

export function DataTable({
  caption,
  columns,
  rows,
  empty,
}: {
  caption: string;
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  empty?: React.ReactNode;
}) {
  if (rows.length === 0) {
    return <div className="text-sm text-muted">{empty ?? "No rows."}</div>;
  }

  return (
    <div className="obs-card overflow-x-auto">
      <table className="obs-table w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-navy/10 bg-navy text-left text-white">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-2.5 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-navy/8 align-top last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2.5 text-navy/85">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ShareBars({
  rows,
}: {
  rows: Array<{ label: string; percent: number | null; note?: string }>;
}) {
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="font-medium text-navy">{row.label}</span>
            <span className="tabular-nums text-muted">
              {row.percent == null ? (row.note ?? "Unknown") : `${row.percent.toFixed(1)}%`}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-navy/10" aria-hidden>
            <div
              className={cn(
                "h-2 rounded-full bg-navy",
                row.percent == null && "bg-navy/20",
              )}
              style={{ width: `${Math.max(0, Math.min(100, row.percent ?? 0))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

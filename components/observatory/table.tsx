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
    return <div className="text-sm text-navy/70">{empty ?? "No rows."}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="obs-table w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-navy/20 text-left">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-2 py-2 font-semibold text-navy">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-obs-rule align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2 py-2.5 text-navy/85">
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
            <span className="tabular-nums text-navy/70">
              {row.percent == null ? (row.note ?? "Unknown") : `${row.percent.toFixed(1)}%`}
            </span>
          </div>
          <div className="mt-1 h-2 bg-navy/10" aria-hidden>
            <div
              className={cn("h-2 bg-obs-teal", row.percent == null && "bg-navy/20")}
              style={{ width: `${Math.max(0, Math.min(100, row.percent ?? 0))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

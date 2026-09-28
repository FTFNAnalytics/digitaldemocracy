export function PlainTable({
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
    return <p className="text-sm text-atlas-ink-2">{empty ?? "Not supplied"}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-atlas-line bg-atlas-card">
      <table className="w-full min-w-[36rem] border-collapse text-sm text-atlas-ink">
        <caption className="px-3 py-3 text-left text-sm font-semibold text-atlas-ink">{caption}</caption>
        <thead>
          <tr className="border-b border-atlas-line text-left">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-atlas-line align-top last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2.5">
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

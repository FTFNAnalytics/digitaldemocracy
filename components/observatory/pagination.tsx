import Link from "next/link";
export type Query = Record<string, string | string[] | undefined>;
export function paginate<T>(
  items: T[],
  params: Query,
  key = "page",
  size = 100,
) {
  const raw = params[key];
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  const pages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(
    pages,
    Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1,
  );
  return {
    items: items.slice((page - 1) * size, page * size),
    page,
    pages,
    total: items.length,
    key,
  };
}
export function Pagination({
  result,
  params,
}: {
  result: { page: number; pages: number; total: number; key: string };
  params: Query;
}) {
  const href = (page: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) q.set(k, Array.isArray(v) ? v[0] : v);
    }
    q.set(result.key, String(page));
    return `?${q}`;
  };
  return (
    <nav
      aria-label={`${result.key} pagination`}
      className="my-4 flex flex-wrap items-center gap-4 text-sm"
    >
      <span>
        {result.total.toLocaleString()} records · Page {result.page} of{" "}
        {result.pages}
      </span>
      {result.page > 1 && (
        <Link className="obs-link" href={href(result.page - 1)}>
          Previous
        </Link>
      )}
      {result.page < result.pages && (
        <Link className="obs-link" href={href(result.page + 1)}>
          Next
        </Link>
      )}
    </nav>
  );
}

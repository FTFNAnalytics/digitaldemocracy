import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { PageHeader } from "@/components/atlas/page-header";
import { SearchKeyboard } from "@/components/atlas/search-keyboard";
import { loadAtlasCatalog } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";
import { search } from "@/lib/atlas/search";
import {
  SEARCH_LEVELS,
  SEARCH_MODES,
  SearchInputError,
  parseAtlasSearchParams,
  searchModeLabel,
  type SearchMode,
  type SearchQuery,
} from "@/lib/atlas/search-params";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta(staticPageSeo.atlasSearch);

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function rawParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function modeHref(mode: SearchMode, query: SearchQuery): string {
  const params = new URLSearchParams();
  params.set("mode", mode);
  if (query.q) params.set("q", query.q);
  if (query.country) params.set("country", query.country);
  if (query.level) params.set("level", query.level);
  if (query.yearFrom != null) params.set("from", String(query.yearFrom));
  if (query.yearTo != null) params.set("to", String(query.yearTo));
  return `${atlasRoutes.search}?${params.toString()}`;
}

export default async function AtlasSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  let query: SearchQuery = { mode: "seat", q: rawParam(params, "q"), limit: 20 };
  let inputError: string | null = null;
  try {
    query = parseAtlasSearchParams(params, { maxLimit: 20 });
  } catch (error) {
    if (!(error instanceof SearchInputError)) throw error;
    inputError = error.message;
    const mode = rawParam(params, "mode");
    query = {
      mode: (SEARCH_MODES as readonly string[]).includes(mode) ? (mode as SearchMode) : "seat",
      q: rawParam(params, "q").slice(0, 200),
      country: rawParam(params, "country") || undefined,
      level: rawParam(params, "level") || undefined,
      limit: 20,
    };
  }

  const catalog = loadAtlasCatalog();
  const hits = inputError || catalog.status !== "ready" || !query.q.trim() ? [] : search({ ...query, limit: 21 });
  const shown = hits.slice(0, 20);
  const more = hits.length > 20;

  return (
    <>
      <PageHeader
        name="Search"
        level={searchModeLabel(query.mode)}
        facts={[{ label: "Focus", value: "Europe first" }]}
      />
      {catalog.status !== "ready" ? (
        <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />
      ) : (
        <SearchKeyboard>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Search mode">
            {SEARCH_MODES.map((mode) => {
              const selected = mode === query.mode;
              return (
                <Link
                  key={mode}
                  href={modeHref(mode, query)}
                  aria-current={selected ? "page" : undefined}
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                    selected ? "border-atlas-accent bg-atlas-tint text-atlas-accent" : "border-atlas-line text-atlas-ink"
                  }`}
                >
                  {searchModeLabel(mode)}
                </Link>
              );
            })}
          </div>
          <form action={atlasRoutes.search} method="get" className="obs-card mb-6 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="mode" value={query.mode} />
            <label className="block text-sm sm:col-span-2 lg:col-span-3">
              <span className="mb-1 block font-medium text-atlas-ink">Search</span>
              <input
                name="q"
                defaultValue={query.q}
                maxLength={200}
                placeholder="Name, place, or date"
                className="obs-input w-full"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-atlas-ink">Country</span>
              <select name="country" defaultValue={query.country ?? ""} className="obs-input w-full">
                <option value="">Any</option>
                {catalog.countries.map((country) => (
                  <option key={country.countryId} value={country.countryId}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-atlas-ink">Level</span>
              <select name="level" defaultValue={query.level ?? ""} className="obs-input w-full">
                <option value="">Any</option>
                {SEARCH_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-atlas-ink">From year</span>
                <input name="from" inputMode="numeric" defaultValue={query.yearFrom ?? ""} className="obs-input w-full" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-atlas-ink">To year</span>
                <input name="to" inputMode="numeric" defaultValue={query.yearTo ?? ""} className="obs-input w-full" />
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button type="submit" className="obs-btn">
                Search
              </button>
            </div>
          </form>
          {inputError ? <p className="mb-4 text-sm text-atlas-ink-2">{inputError}</p> : null}
          {!query.q.trim() && !inputError ? (
            <p className="text-sm text-atlas-ink-2">Type a name, place, or date. The address of this page keeps the search.</p>
          ) : null}
          {query.q.trim() && !inputError && shown.length === 0 ? (
            <p className="text-sm text-atlas-ink-2">No matches.</p>
          ) : null}
          {shown.length > 0 ? (
            <ol className="grid gap-3" aria-label="Search results">
              {shown.map((hit) => (
                <li key={`${hit.mode}:${hit.countryId}:${hit.title}:${hit.disambiguation}`} className="rounded-2xl border border-atlas-line bg-atlas-card px-4 py-3">
                  <a data-search-result href={hit.href} className="font-semibold text-atlas-accent hover:underline">
                    {hit.title}
                  </a>
                  <p className="mt-1 text-sm text-atlas-ink" dangerouslySetInnerHTML={{ __html: hit.snippet }} />
                  <p className="mt-1 text-sm text-atlas-ink-2">{hit.disambiguation}</p>
                </li>
              ))}
            </ol>
          ) : null}
          {more ? <p className="mt-4 text-sm text-atlas-ink-2">Showing the first 20 matches.</p> : null}
        </SearchKeyboard>
      )}
    </>
  );
}

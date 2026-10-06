import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CyclePageView } from "@/components/atlas/cycle-page";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { filterContestText } from "@/lib/atlas/cycle/format";
import {
  CYCLE_CONTEST_PAGE_SIZE,
  CYCLE_RESULT_PAGE_SIZE,
  loadContestPanel,
  loadCyclePage,
  type CycleContest,
  type CycleLoad,
} from "@/lib/atlas/cycle/read";
import { readAtlasDerived } from "@/lib/atlas/publication";

export const revalidate = false;

type Props = {
  params: Promise<{ country: string; date: string; scope?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

function pageNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 10_000);
}

/** Keep the cached shell under Next's 2MB data-cache limit. Result rows are loaded per contest. */
function cacheShell(loaded: CycleLoad): CycleLoad {
  if (loaded.status !== "ready") return loaded;
  if (loaded.model.contests.length <= CYCLE_CONTEST_PAGE_SIZE) return loaded;
  const contests = loaded.model.contests.map((contest) => ({
    ...contest,
    results: [],
    proceedings: [],
    methodChips: [],
    provenance: {
      publisher: null,
      title: null,
      url: null,
      snapshotLabel: contest.provenance.snapshotLabel,
      evidenceGrade: null,
      recordId: contest.provenance.recordId,
    },
  }));
  return { ...loaded, model: { ...loaded.model, contests } };
}

async function load(country: string, date: string, scope: string[] | undefined): Promise<CycleLoad> {
  return readAtlasDerived(`cycle-shell:${country}:${date}:${(scope ?? []).join("/")}`, () =>
    cacheShell(loadCyclePage({ country, dateToken: date, scope, resultMode: "shell" })),
  );
}

function selectedContest(contests: CycleContest[], requested: string): CycleContest | null {
  if (contests.length === 0) return null;
  return contests.find((contest) => contest.eventId === requested) ?? contests[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, date, scope } = await params;
  const loaded = await load(country, date, scope);
  if (loaded.status === "unavailable" || loaded.status === "not_found") {
    return { title: "Atlas election not found", robots: { index: false, follow: true } };
  }
  if (loaded.status === "alias") {
    return { alternates: { canonical: loaded.path }, robots: { index: false, follow: true } };
  }
  const title = `${loaded.model.label} · Election Atlas`;
  return {
    title: { absolute: title },
    description: loaded.model.description,
    alternates: { canonical: loaded.model.path },
    openGraph: { title, description: loaded.model.description, url: loaded.model.path },
  };
}

export default async function AtlasCyclePage({ params, searchParams }: Props) {
  const { country, date, scope } = await params;
  const query = await searchParams;
  const loaded = await load(country, date, scope);
  if (loaded.status === "unavailable") {
    return <DatabaseUnavailable message={loaded.message} sqlitePath={loaded.sqlitePath} />;
  }
  if (loaded.status === "not_found") notFound();
  if (loaded.status === "alias") permanentRedirect(loaded.path);

  const q = one(query.q).slice(0, 200);
  const requested = one(query.contest);
  const listPage = pageNumber(one(query.list));
  const resultPage = pageNumber(one(query.results));
  const contests = loaded.model.contests;
  const filtered = contests.filter((contest) => filterContestText(contest.officeName, contest.bodyName, q));
  const start = (listPage - 1) * CYCLE_CONTEST_PAGE_SIZE;
  const pageContests = filtered.slice(start, start + CYCLE_CONTEST_PAGE_SIZE);
  const picked = selectedContest(contests, requested);
  let selected = picked;
  if (picked) {
    const panel = loadContestPanel({
      idNamespace: picked.record.idNamespace,
      officeId: picked.record.officeId,
      historyKey: picked.record.historyKey,
      eventId: picked.eventId,
      snapshotLabel: picked.provenance.snapshotLabel,
      page: resultPage,
    });
    selected = {
      ...picked,
      results: panel.results,
      resultCount: panel.resultCount,
      proceedings: panel.proceedings,
      methodChips: panel.methodChips,
      provenance: panel.provenance,
    };
  }
  const rendered = pageContests.map((contest) => (selected && contest.eventId === selected.eventId ? selected : contest));
  if (selected && !rendered.some((contest) => contest.eventId === selected.eventId)) rendered.unshift(selected);

  return (
    <CyclePageView
      model={{ ...loaded.model, contests: rendered }}
      contest={requested}
      q={q}
      listPage={listPage}
      listPageSize={CYCLE_CONTEST_PAGE_SIZE}
      listTotal={filtered.length}
      contestsPaged
      resultPage={resultPage}
      resultPageSize={CYCLE_RESULT_PAGE_SIZE}
    />
  );
}

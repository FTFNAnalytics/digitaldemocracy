import Link from "next/link";
import { atlasRoutes } from "@/lib/atlas/routes";
import { contestHref, filterContestText, selectedContestId } from "@/lib/atlas/cycle/format";
import type { CycleContest, CycleContestResult, CyclePageModel } from "@/lib/atlas/cycle/read";
import { readerTurnout } from "@/lib/atlas/seat/history";
import { Breadcrumb } from "./breadcrumb";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";
import { ProvenanceFooter } from "./provenance-footer";
import { RecordDetails } from "./record-details";
import { ResultsTable } from "./results-table";
import type { ResultBarRow } from "./types";

function toBars(rows: CycleContestResult[]): ResultBarRow[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    labelHref: row.label ? atlasRoutes.candidateSearch(row.label) : null,
    partyLabel: row.partyLabel,
    votes: row.votes,
    votesStatus: row.votesStatus,
    share: row.share,
    shareStatus: row.shareStatus,
    seats: row.seats,
    seatsStatus: row.seatsStatus,
    elected: row.elected,
    evidenceStatus: row.evidenceStatus,
  }));
}

function Tile({ kind, label, value }: { kind: string; label: string; value: string }) {
  return (
    <div data-cycle-tile={kind} className="min-w-36 rounded-2xl border border-atlas-line bg-atlas-card px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">{label}</p>
      <p className="mt-1 font-atlas-heading text-2xl text-atlas-ink">{value}</p>
    </div>
  );
}

function ContestList({
  contests,
  path,
  q,
  selectedId,
  showPrecision,
  listPage,
}: {
  contests: CycleContest[];
  path: string;
  q: string;
  selectedId: string | null;
  showPrecision: boolean;
  listPage: number;
}) {
  const groups: Array<{ heading: string; bodies: Array<{ name: string; contests: CycleContest[] }> }> = [];
  for (const contest of contests) {
    let group = groups.find((item) => item.heading === contest.tierHeading);
    if (!group) {
      group = { heading: contest.tierHeading, bodies: [] };
      groups.push(group);
    }
    let body = group.bodies.find((item) => item.name === contest.bodyName);
    if (!body) {
      body = { name: contest.bodyName, contests: [] };
      group.bodies.push(body);
    }
    body.contests.push(contest);
  }

  if (groups.length === 0) {
    return <p className="text-sm text-atlas-ink-2">No contests match this filter.</p>;
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.heading}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">{group.heading}</h2>
          <div className="mt-2 space-y-3">
            {group.bodies.map((body) => (
              <div key={body.name}>
                <h3 className="text-sm font-semibold text-atlas-ink">{body.name}</h3>
                <ul className="mt-1 space-y-1">
                  {body.contests.map((contest) => {
                    const current = contest.eventId === selectedId;
                    return (
                      <li key={contest.eventId}>
                        <Link
                          href={contestHref(path, contest.eventId, q, { list: listPage })}
                          data-contest={contest.eventId}
                          aria-current={current ? "page" : undefined}
                          className={
                            current
                              ? "block rounded-xl bg-atlas-tint px-2 py-1.5 font-semibold text-atlas-accent"
                              : "block rounded-xl px-2 py-1.5 text-atlas-accent hover:bg-atlas-tint hover:underline"
                          }
                        >
                          {contest.officeName}
                          {showPrecision ? (
                            <span className="mt-0.5 block text-xs font-normal text-atlas-ink-2">{contest.precisionLabel}</span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ContestPanel({
  contest,
  path,
  q,
  listPage,
  resultPage,
  resultPageSize,
}: {
  contest: CycleContest;
  path: string;
  q: string;
  listPage: number;
  resultPage: number;
  resultPageSize: number;
}) {
  return (
    <section data-selected-contest={contest.eventId} aria-labelledby="cycle-contest-heading">
      <h2 id="cycle-contest-heading" className="font-atlas-heading text-2xl text-atlas-ink">
        <Link href={contest.seatHref} className="text-atlas-accent hover:underline">
          {contest.officeName}
        </Link>
      </h2>
      <p className="mt-2 text-sm">
        <Link href={contest.eventHref} className="font-semibold text-atlas-accent hover:underline">
          This contest
        </Link>
      </p>
      {contest.methodChips.length > 0 ? (
        <ul aria-label="Method" className="mt-4 flex flex-wrap gap-2">
          {contest.methodChips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-atlas-line bg-atlas-tint px-2.5 py-0.5 text-xs font-semibold text-atlas-ink"
            >
              {chip}
            </li>
          ))}
        </ul>
      ) : null}
      {contest.proceedings.length > 0 ? (
        <ol aria-label="Proceedings" className="mt-4 space-y-2 text-sm text-atlas-ink">
          {contest.proceedings.map((proceeding) => (
            <li
              key={proceeding.id}
              data-proceeding={proceeding.id}
              className={proceeding.superseded ? "line-through" : undefined}
            >
              {proceeding.kindLabel} · {proceeding.legalOutcomeLabel}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-atlas-ink-2">No proceedings were supplied for this contest.</p>
      )}
      <div className="mt-4">
        {contest.results.length === 0 ? (
          <EmptyState variant="not_supplied" title="Results were not supplied">
            <p>Missing results are not shown as zero.</p>
          </EmptyState>
        ) : (
          <>
            <ResultsTable
              caption={`Results for ${contest.officeName}`}
              rows={toBars(contest.results)}
              shareUnit={contest.shareUnit}
            />
            {contest.resultCount > resultPageSize ? (
              <p className="mt-3 text-sm text-atlas-ink-2">
                Showing {((resultPage - 1) * resultPageSize + 1).toLocaleString("en-US")}–
                {((resultPage - 1) * resultPageSize + contest.results.length).toLocaleString("en-US")} of{" "}
                {contest.resultCount.toLocaleString("en-US")} result rows.
              </p>
            ) : null}
            {contest.resultCount > resultPageSize ? (
              <p className="mt-2 flex flex-wrap gap-4 text-sm">
                {resultPage > 1 ? (
                  <Link
                    href={contestHref(path, contest.eventId, q, { list: listPage, results: resultPage - 1 })}
                    className="font-semibold text-atlas-accent hover:underline"
                  >
                    Previous results
                  </Link>
                ) : null}
                {(resultPage - 1) * resultPageSize + contest.results.length < contest.resultCount ? (
                  <Link
                    href={contestHref(path, contest.eventId, q, { list: listPage, results: resultPage + 1 })}
                    className="font-semibold text-atlas-accent hover:underline"
                  >
                    Show more results
                  </Link>
                ) : null}
              </p>
            ) : null}
          </>
        )}
      </div>
      <ProvenanceFooter
        publisher={contest.provenance.publisher}
        title={contest.provenance.title}
        url={contest.provenance.url}
        snapshotLabel={contest.provenance.snapshotLabel}
        evidenceGrade={contest.provenance.evidenceGrade}
        recordId={contest.provenance.recordId}
      />
      <RecordDetails
        officeId={contest.record.officeId}
        idNamespace={contest.record.idNamespace}
        lineageId={contest.record.lineageId}
        releaseId={contest.record.releaseId}
        historyKey={contest.record.historyKey}
      />
    </section>
  );
}

export function CyclePageView({
  model,
  contest,
  q,
  listPage = 1,
  listPageSize = model.contests.length || 1,
  listTotal,
  contestsPaged = false,
  resultPage = 1,
  resultPageSize = 40,
}: {
  model: CyclePageModel;
  contest: string;
  q: string;
  listPage?: number;
  listPageSize?: number;
  /** Full filtered contest count when `model.contests` is already one page. */
  listTotal?: number;
  contestsPaged?: boolean;
  resultPage?: number;
  resultPageSize?: number;
}) {
  const selectedId = selectedContestId(
    model.contests.map((item) => item.eventId),
    contest,
  );
  const selected = model.contests.find((item) => item.eventId === selectedId) ?? null;
  const filtered = model.contests.filter((item) => filterContestText(item.officeName, item.bodyName, q));
  const listStart = Math.max(0, (listPage - 1) * listPageSize);
  const visible = contestsPaged ? filtered : filtered.slice(listStart, listStart + listPageSize);
  const listPages = Math.max(1, Math.ceil((listTotal ?? filtered.length) / listPageSize));
  const turnout = model.turnout == null ? null : readerTurnout(model.turnout);

  return (
    <article data-cycle-page={model.kind}>
      <Breadcrumb items={model.crumbs} />
      <PageHeader
        name={model.label}
        level={model.dateChip}
        facts={[
          { label: "Contests", value: model.contestCount.toLocaleString("en-US") },
          { label: "Place", value: model.placeName },
        ]}
        summary={
          <div className="flex flex-wrap items-stretch gap-3">
            {model.ballots != null ? (
              <Tile kind="ballots" label="Ballots cast" value={model.ballots.toLocaleString("en-US")} />
            ) : null}
            {turnout ? <Tile kind="turnout" label="Turnout" value={turnout} /> : null}
            {model.csvHref ? (
              <a
                href={model.csvHref}
                className="self-center font-semibold text-atlas-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-accent"
              >
                Download
              </a>
            ) : null}
          </div>
        }
      />

      {model.switcher.length > 0 ? (
        <nav aria-label="Other election dates" className="mb-8">
          <ul className="flex flex-wrap gap-2">
            {model.switcher.map((chip) => (
              <li key={chip.id}>
                <Link
                  href={chip.href}
                  data-switcher={chip.sortKey}
                  data-atlas-cycle={chip.hasResults ? "results" : "none"}
                  aria-current={chip.current ? "page" : undefined}
                  className={
                    chip.hasResults
                      ? "inline-flex flex-col rounded-2xl border border-atlas-line bg-atlas-card px-3 py-2 text-atlas-ink hover:bg-atlas-tint"
                      : "inline-flex flex-col rounded-2xl border border-dashed border-atlas-line bg-atlas-card px-3 py-2 text-atlas-ink-2 hover:bg-atlas-tint"
                  }
                >
                  <span className="font-semibold">{chip.label}</span>
                  <span className="text-xs">{chip.hasResults ? "Results on file" : "No results yet"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-24">
          <h2 className="font-atlas-heading text-xl text-atlas-ink">Contests</h2>
          <form method="get" action={model.path} className="mt-3 mb-4">
            {selectedId ? <input type="hidden" name="contest" value={selectedId} /> : null}
            <label className="block text-sm text-atlas-ink">
              <span className="mb-1 block font-semibold">Filter contests</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                className="w-full rounded-xl border border-atlas-line bg-atlas-card px-3 py-2 text-atlas-ink"
              />
            </label>
          </form>
          <ContestList
            contests={visible}
            path={model.path}
            q={q}
            selectedId={selectedId}
            showPrecision={model.kind !== "day"}
            listPage={listPage}
          />
          {listPages > 1 ? (
            <p className="mt-3 flex flex-wrap gap-4 text-sm">
              {listPage > 1 ? (
                <Link
                  href={contestHref(model.path, selectedId, q, { list: listPage - 1 })}
                  className="font-semibold text-atlas-accent hover:underline"
                >
                  Previous contests
                </Link>
              ) : null}
              {listPage < listPages ? (
                <Link
                  href={contestHref(model.path, selectedId, q, { list: listPage + 1 })}
                  className="font-semibold text-atlas-accent hover:underline"
                >
                  More contests
                </Link>
              ) : null}
            </p>
          ) : null}
        </aside>
        <div className="min-w-0">
          {model.queued ? (
            <div data-cycle-queued="true">
              <EmptyState variant="queued" title={`Results for ${model.dateChip} are not yet ingested`}>
                {model.countryNotes ? <p>{model.countryNotes}</p> : <p>These records are not in the Atlas yet.</p>}
              </EmptyState>
              {selected ? (
                <RecordDetails
                  officeId={selected.record.officeId}
                  idNamespace={selected.record.idNamespace}
                  lineageId={selected.record.lineageId}
                  releaseId={selected.record.releaseId}
                  historyKey={selected.record.historyKey}
                />
              ) : null}
            </div>
          ) : selected ? (
            <ContestPanel
              contest={selected}
              path={model.path}
              q={q}
              listPage={listPage}
              resultPage={resultPage}
              resultPageSize={resultPageSize}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CiteBlock, PageHeader } from "@/components/observatory/chrome";
import { ValuePill } from "@/components/observatory/status";
import { DataTable, ShareBars } from "@/components/observatory/table";
import {
  dateCertaintyLabel,
  formatResearchDate,
} from "@/lib/observatory/dates";
import {
  eventKindLabel,
  formatNumeric,
  formatShare,
  legalOutcomeLabel,
} from "@/lib/observatory/format";
import {
  getCountry,
  getEvent,
  getOffice,
  proceedingsForEvent,
  sourcesByIds,
} from "@/lib/observatory/load";
import { toPercent } from "@/lib/observatory/metrics";
import { obsRoutes } from "@/lib/observatory/routes";

type Props = { params: Promise<{ eventId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = getEvent(eventId);
  return { title: event ? formatResearchDate(event.date) : "Election" };
}

export default async function EventPage({ params }: Props) {
  const { eventId } = await params;
  const event = getEvent(eventId);
  if (!event) notFound();
  const office = getOffice(event.officeId);
  const country = getCountry(event.countryId);
  const proceedings = proceedingsForEvent(event.id);
  const sources = sourcesByIds(event.sourceIds);

  return (
    <article>
      <PageHeader
        eyebrow="Election / event"
        title={formatResearchDate(event.date)}
        description={`${eventKindLabel(event.kind)} · ${legalOutcomeLabel(event.legalOutcome)} · ${dateCertaintyLabel(event.date.certainty)}`}
      >
        <p className="mt-3 text-sm text-navy/70">
          {office ? (
            <Link href={obsRoutes.office(office.id)} className="obs-link">
              {office.names.official}
            </Link>
          ) : (
            event.officeId
          )}
          {country ? ` · ${country.names.official}` : ""}
          <span className="ml-2 font-mono text-xs">{event.id}</span>
        </p>
      </PageHeader>

      <dl className="mb-8 grid gap-3 sm:grid-cols-2">
        <Fact
          label="Vote basis"
          value={event.ballotBasis.replaceAll("_", " ")}
        />
        <Fact
          label="Share unit"
          value={event.voteShareUnit.replaceAll("_", " ")}
        />
        <Fact label="Electoral system" value={event.electoralSystem} />
        <Fact label="Comparability" value={event.comparability} />
        <Fact label="Selected-history role" value={event.selectedHistoryRole} />
        <Fact label="History key" value={event.historyKey} />
      </dl>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Candidate and list results</h2>
        {event.resultRows.length === 0 ? (
          <p className="mt-3 text-sm text-navy/70">
            No result rows — this event has not been held or returns were not
            supplied.
          </p>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <ShareBars
              rows={event.resultRows.map((row) => ({
                label: row.label,
                percent:
                  row.share.value == null
                    ? null
                    : toPercent(row.share.value, row.shareUnit),
                note: row.share.status,
              }))}
            />
            <DataTable
              caption={`Full results for ${event.id}`}
              columns={[
                "Label / candidate",
                "Party",
                "Votes",
                "Share",
                "Seats",
                "Elected",
                "Substitute",
                "Status",
              ]}
              rows={event.resultRows.map((row) => [
                [row.label, row.candidate].filter(Boolean).join(" · "),
                <span key={row.id} className="font-mono text-xs">
                  {row.partyCode}
                </span>,
                formatNumeric(row.votes),
                formatShare(row.share, row.shareUnit),
                formatNumeric(row.seats),
                row.electedFlag == null
                  ? "Unknown"
                  : row.electedFlag
                    ? "Yes"
                    : "No",
                row.isSubstitute ? "Yes" : "No",
                <ValuePill key={`${row.id}-st`} status={row.evidenceStatus} />,
              ])}
            />
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Proceedings</h2>
        <p className="mt-2 text-sm text-navy/70">
          A recount is a result version, not an extra election. Annulments
          remain evidence without becoming valid completed cycles.
        </p>
        {proceedings.length === 0 ? (
          <p className="mt-3 text-sm text-navy/70">No proceedings attached.</p>
        ) : (
          <DataTable
            caption="Proceedings"
            columns={["Kind", "Round", "Legal outcome", "Supersedes", "Notes"]}
            rows={proceedings.map((row) => [
              row.kind,
              row.round ?? "—",
              legalOutcomeLabel(row.legalOutcome),
              row.supersedesId ?? "—",
              row.notes,
            ])}
          />
        )}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Sources</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {sources.map((source) => (
            <li key={source.id}>
              <Link
                href={`${obsRoutes.sources}?q=${encodeURIComponent(source.id)}#${source.id}`}
                className="obs-link"
              >
                {source.publisher}: {source.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CiteBlock
        title={`${office?.names.official ?? event.officeId}, ${formatResearchDate(event.date)}`}
        path={obsRoutes.event(event.id)}
      />
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="obs-card px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wider text-navy/55">
        {label}
      </dt>
      <dd className="mt-1 text-navy">{value}</dd>
    </div>
  );
}

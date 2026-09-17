import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtlasPageHeader } from "@/components/atlas/chrome";
import { EmptyState } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import {
  formatAtlasDate,
  listAtlasProceedings,
  listAtlasResults,
  loadAtlasCatalog,
  lookupAtlasEvent,
} from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";

type Props = {
  params: Promise<{ eventId: string }>;
};

function formatShare(share: number | null, status: string): string {
  if (share == null) return status === "unknown" ? "not supplied" : status.replaceAll("_", " ");
  return `${share}% (${status})`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const lookup = lookupAtlasEvent(decodeURIComponent(eventId));
  if (lookup.status !== "found") {
    return { title: "Atlas election not found", robots: { index: false, follow: true } };
  }
  return {
    title: `${lookup.record.officeName} · ${formatAtlasDate(lookup.record)} · Election Atlas`,
    description: `Imported Atlas election listing for ${lookup.record.officeName} (${lookup.record.eventId}).`,
  };
}

export default async function AtlasEventPage({ params }: Props) {
  const { eventId: rawId } = await params;
  const eventId = decodeURIComponent(rawId);
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return (
      <EmptyState title="Atlas database is not loaded">
        <p>{catalog.message}</p>
        <p className="mt-2">
          Resolved path: <code className="text-navy">{catalog.sqlitePath}</code>
        </p>
      </EmptyState>
    );
  }

  const lookup = lookupAtlasEvent(eventId);
  if (lookup.status === "missing") notFound();
  if (lookup.status === "ambiguous") {
    return (
      <EmptyState title="Public event ID is namespace-ambiguous">
        <p>
          Prompt B uniqueness for <code className="text-navy">event_id</code> is{" "}
          <code className="text-navy">(id_namespace, event_id)</code>, not a global public ID. This
          bare observatory ID matches {lookup.namespaces.length} namespaces (
          {lookup.namespaces.join(", ")}
          ) and is not silently resolved.
        </p>
      </EmptyState>
    );
  }

  const event = lookup.record;
  const results = listAtlasResults(event.officeId, event.historyKey);
  const proceedings = listAtlasProceedings(event.officeId, event.historyKey);

  return (
    <>
      <AtlasPageHeader
        eyebrow="Election / event"
        title={formatAtlasDate(event)}
        description={`${event.eventKind} · ${event.selectedHistoryRole} history · legal ${event.legalOutcome}`}
      >
        <p className="mt-3 text-sm text-navy/70">
          <Link href={atlasRoutes.office(event.officeId)} className="obs-link">
            {event.officeName}
          </Link>
          {event.countryName ? ` · ${event.countryName}` : ""}
          <span className="ml-2 font-mono text-xs">{event.eventId}</span>
        </p>
      </AtlasPageHeader>

      <dl className="mb-8 grid gap-3 sm:grid-cols-2">
        <Fact label="Vote basis" value={event.ballotBasis.replaceAll("_", " ")} />
        <Fact label="Share unit" value={event.shareUnit.replaceAll("_", " ") || "not supplied"} />
        <Fact label="Electoral system" value={event.electoralSystem ?? "not supplied"} />
        <Fact label="Comparability" value={event.comparability ?? "not supplied"} />
        <Fact label="Selected-history role" value={event.selectedHistoryRole} />
        <Fact label="History key" value={event.historyKey} />
      </dl>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Candidate and list results</h2>
        {results.length === 0 ? (
          <p className="mt-3 text-sm text-navy/70">
            No result rows — this event has not been held or returns were not supplied. Missing is
            not treated as zero.
          </p>
        ) : (
          <div className="mt-4">
            <DataTable
              caption={`Results for ${event.eventId}`}
              columns={["Candidate / list", "Party", "Votes", "Share", "Seats", "Evidence"]}
              empty="No result rows attached to this event."
              rows={results.map((row) => [
                row.label ?? "label not supplied",
                row.partyLabel ?? "—",
                row.votes == null ? row.votesStatus.replaceAll("_", " ") : row.votes.toLocaleString(),
                formatShare(row.share, row.shareStatus),
                row.seats == null ? row.seatsStatus.replaceAll("_", " ") : String(row.seats),
                row.evidenceStatus.replaceAll("_", " "),
              ])}
            />
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Proceedings</h2>
        {proceedings.length === 0 ? (
          <p className="mt-3 text-sm text-navy/70">No proceedings attached in Atlas SQLite.</p>
        ) : (
          <DataTable
            caption="Proceedings"
            columns={["Kind", "Sequence", "Legal outcome", "Supersedes"]}
            rows={proceedings.map((row) => [
              row.kind,
              row.sequenceNo == null ? "—" : String(row.sequenceNo),
              row.legalOutcome,
              row.supersedesId ?? "—",
            ])}
          />
        )}
      </section>

      <p className="text-sm">
        <Link href={atlasRoutes.explorer} className="obs-link">
          Atlas explorer
        </Link>
        {" · "}
        <Link href={atlasRoutes.home} className="obs-link">
          Atlas index
        </Link>
        {" · observatory catalogue unchanged at /electiondatabase"}
      </p>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="obs-card px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wider text-navy/55">{label}</dt>
      <dd className="mt-1 text-navy">{value}</dd>
    </div>
  );
}

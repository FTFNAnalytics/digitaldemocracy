import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtlasPageHeader } from "@/components/atlas/chrome";
import { EmptyState } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import {
  formatAtlasDate,
  formatAtlasTier,
  listAtlasEvents,
  listAtlasResults,
  loadAtlasCatalog,
  lookupAtlasOffice,
} from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";

type Props = {
  params: Promise<{ officeId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { officeId } = await params;
  const lookup = lookupAtlasOffice(decodeURIComponent(officeId));
  if (lookup.status !== "found") {
    return { title: "Atlas office not found", robots: { index: false, follow: true } };
  }
  return {
    title: `${lookup.record.name} · Election Atlas`,
    description: `Imported Atlas election and history listings for ${lookup.record.name}.`,
  };
}

function formatShare(share: number | null, status: string): string {
  if (share == null) return status === "unknown" ? "not supplied" : status.replaceAll("_", " ");
  return `${share}% (${status})`;
}

export default async function AtlasOfficePage({ params }: Props) {
  const { officeId: rawId } = await params;
  const officeId = decodeURIComponent(rawId);
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return (
      <EmptyState title="Atlas database is not loaded">
        <p>{catalog.message}</p>
      </EmptyState>
    );
  }

  const lookup = lookupAtlasOffice(officeId);
  if (lookup.status === "missing") notFound();
  if (lookup.status === "ambiguous") {
    return (
      <EmptyState title="Public office ID is namespace-ambiguous">
        <p>
          Prompt B uniqueness for <code className="text-navy">office_id</code> is{" "}
          <code className="text-navy">(id_namespace, office_id)</code>. This bare observatory ID
          matches {lookup.namespaces.length} namespaces ({lookup.namespaces.join(", ")}) and is not
          silently resolved.
        </p>
      </EmptyState>
    );
  }
  const office = lookup.record;
  const events = listAtlasEvents(officeId);

  return (
    <>
      <AtlasPageHeader
        eyebrow={office.geographyName ?? office.countryId}
        title={office.name}
        description={`${office.officeType} · ${formatAtlasTier(office.tier)} · ${office.officeStatus}`}
      >
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-navy/70">
          <span>ID {office.officeId}</span>
          {office.nextLabel ? <span>Next: {formatAtlasDate(office)}</span> : <span>Next election date not supplied</span>}
        </div>
      </AtlasPageHeader>

      <p className="mb-6 text-sm">
        <Link href={atlasRoutes.country(office.countryId)} className="obs-link">
          {office.countryId}
        </Link>
        {" · "}
        <Link href={atlasRoutes.home} className="obs-link">
          Atlas index
        </Link>
        {" · "}
        <Link href={atlasRoutes.explorer} className="obs-link">
          Explorer
        </Link>
      </p>

      {events.length === 0 ? (
        <EmptyState title="No election events imported">
          This office has no rows in election_event.
        </EmptyState>
      ) : (
        events.map((event) => {
          const results = listAtlasResults(officeId, event.historyKey);
          return (
            <section key={event.eventId} className="mb-10">
              <h2 className="obs-heading text-xl">
                {event.selectedHistoryRole === "none" ? "Upcoming / prospective" : "History"} ·{" "}
                {formatAtlasDate(event)}
              </h2>
              <p className="mt-2 text-sm text-navy/70">
                {event.eventKind} · {event.selectedHistoryRole} history · legal {event.legalOutcome}
                {event.electoralSystem ? ` · ${event.electoralSystem}` : ""} · ballot {event.ballotBasis.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-xs text-navy/55">
                <Link href={atlasRoutes.event(event.eventId)} className="obs-link">
                  event {event.eventId}
                </Link>
                {" · "}
                {event.resultCount.toLocaleString()} result rows
              </p>
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
            </section>
          );
        })
      )}
    </>
  );
}

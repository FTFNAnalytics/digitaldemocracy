import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { JurisdictionTemplate } from "@/components/atlas/jurisdiction-template";
import { shareLabel } from "@/components/atlas/labels";
import { DynamicJurisdictionMap } from "@/components/atlas/map/jurisdiction-map-dynamic";
import type { CycleChip, JurisdictionChild, SeatRow } from "@/components/atlas/types";
import type { MapPlace } from "@/lib/atlas/map/model";
import { attributionForCountry, publishedChildrenTopojsonUrl } from "@/lib/atlas/map/publish";
import {
  cycleListHref,
  filterPlaces,
  filterSeatsByDate,
  jurisdictionDescription,
  jurisdictionFacts,
  jurisdictionJsonLd,
  jurisdictionLevelLabel,
  jurisdictionPublicPath,
  jurisdictionTitle,
  loadJurisdictionView,
  reservedSegment,
  resolveJurisdictionPath,
  SEAT_PAGE_SIZE,
  type JurisdictionPlace,
  type JurisdictionSeat,
} from "@/lib/atlas/jurisdiction";
import { readAtlasDerived } from "@/lib/atlas/publication";
import { atlasRoutes } from "@/lib/atlas/routes";
import { upcomingElectionsForJurisdiction } from "@/lib/atlas/upcoming-elections";
import { paginate, Pagination, type Query } from "@/components/observatory/pagination";

/**
 * Static for a publication. Derived rows are cached under the atlas-derived
 * tag and refreshed when derive:atlas runs, not on a timer and not by
 * re-reading SQLite for the view on every request.
 */
export const revalidate = false;

type Props = {
  params: Promise<{ country: string; path?: string[] }>;
  searchParams: Promise<Query>;
};

function one(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

function isoDateParam(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function placeCoverage(place: JurisdictionPlace) {
  if (place.offices == null || place.officesWithResults == null) return null;
  return {
    offices: place.offices,
    officesWithAnyEvent: place.officesWithAnyEvent,
    officesWithResults: place.officesWithResults,
    eventsTotal: place.eventsTotal,
    eventsWithResults: place.eventsWithResults,
    notSuppliedNextDates: place.notSuppliedNextDates,
    latestSnapshotLabel: place.latestSnapshotLabel,
  };
}

function toChild(place: JurisdictionPlace): JurisdictionChild {
  return {
    id: place.id,
    name: place.name,
    href: jurisdictionPublicPath(place.slugPath),
    level: jurisdictionLevelLabel(place.level),
    kind: place.level,
    coverage: placeCoverage(place),
    seatsTracked: place.officeCount,
    firstEventYear: place.firstEventYear,
    lastEventYear: place.lastEventYear,
    nextDateId: place.nextDateId,
    nextYear: place.nextYear,
    turnout: place.turnout,
    margin: place.margin,
    marginUnit: place.marginUnit,
  };
}

function toMapPlace(place: JurisdictionPlace): MapPlace {
  const child = toChild(place);
  return {
    id: child.id,
    name: child.name,
    href: child.href,
    level: child.level,
    levelKey: place.level,
    seatsTracked: place.officeCount,
    firstEventYear: place.firstEventYear,
    lastEventYear: place.lastEventYear,
    coverage: child.coverage,
    nextDateId: place.nextDateId,
    nextYear: place.nextYear,
    turnout: place.turnout,
    margin: place.margin,
    marginUnit: place.marginUnit,
  };
}

function toSeat(seat: JurisdictionSeat): SeatRow {
  return {
    id: seat.id,
    name: seat.name,
    href: atlasRoutes.office(seat.officeId),
    heldBy: seat.heldBy,
    since: seat.since,
    lastResult: seat.lastShare == null ? null : shareLabel(seat.lastShare, "recorded", seat.lastShareUnit),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, path } = await params;
  if (reservedSegment(country, path)) {
    return { title: "Atlas place not found", robots: { index: false, follow: true } };
  }
  const hit = resolveJurisdictionPath(country, path);
  if (hit.status === "unavailable" || hit.status === "not_found" || hit.status === "reserved") {
    return { title: "Atlas place not found", robots: { index: false, follow: true } };
  }
  const canonical = hit.status === "alias" ? hit.canonicalPath : jurisdictionPublicPath(hit.jurisdiction.slugPath);
  if (hit.status === "alias") {
    return { alternates: { canonical }, robots: { index: false, follow: true } };
  }
  const view = await readAtlasDerived(`view:${hit.jurisdiction.slugPath}`, () =>
    loadJurisdictionView(hit.jurisdiction.slugPath),
  );
  if (!view) return { title: "Atlas place not found", robots: { index: false, follow: true } };
  const level = jurisdictionLevelLabel(view.jurisdiction.levelLabel);
  const facts = jurisdictionFacts(view.jurisdiction, view.coverage);
  const title = jurisdictionTitle(view.jurisdiction.name, view.countryName);
  const description = jurisdictionDescription(view.jurisdiction.name, view.countryName, level, facts);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function AtlasJurisdictionPage({ params, searchParams }: Props) {
  const { country, path } = await params;
  const query = await searchParams;
  // Dated cycle pages are the sibling elections/[date] route. A bare reserved segment is not a place.
  if (reservedSegment(country, path)) notFound();

  const hit = resolveJurisdictionPath(country, path);
  if (hit.status === "unavailable") {
    return <DatabaseUnavailable message={hit.message} sqlitePath={hit.sqlitePath} />;
  }
  if (hit.status === "reserved" || hit.status === "not_found") notFound();
  if (hit.status === "alias") permanentRedirect(hit.canonicalPath);

  const view = await readAtlasDerived(`view:${hit.jurisdiction.slugPath}`, () =>
    loadJurisdictionView(hit.jurisdiction.slugPath),
  );
  if (!view) notFound();

  const q = one(query.q).slice(0, 200);
  const kind = one(query.kind).toLowerCase();
  const date = isoDateParam(one(query.date));
  const level = jurisdictionLevelLabel(view.jurisdiction.levelLabel);
  const facts = jurisdictionFacts(view.jurisdiction, view.coverage);
  const upcomingElections = upcomingElectionsForJurisdiction({
    countryId: view.jurisdiction.countryId,
    levelLabel: view.jurisdiction.levelLabel,
  });
  const pathName = jurisdictionPublicPath(view.jurisdiction.slugPath);
  const filteredPlaces = filterPlaces(view.children, { q, kind });
  const kinds = [...new Set(view.children.map((place) => place.level))].sort((a, b) => a.localeCompare(b));
  const useServerFilter = view.children.length > 12 || q.length > 0 || kind.length > 0;
  const datedSeats = filterSeatsByDate(view.seats, date);
  const paged = paginate(datedSeats, query, "page", SEAT_PAGE_SIZE);
  const topojsonUrl = publishedChildrenTopojsonUrl(view.jurisdiction.jurisdictionKey);
  const mapPlaces = view.children.map(toMapPlace);
  const cycles: CycleChip[] = view.cycles.map((cycle) => ({
    id: cycle.id,
    year: cycle.year,
    href: cycleListHref({
      contestCount: cycle.contestCount,
      eventId: cycle.eventId,
      isoDate: cycle.isoDate,
      slugPath: view.jurisdiction.slugPath,
    }),
    hasResults: cycle.hasResults,
    label: cycle.label,
  }));

  return (
    <>
      <JsonLd data={jurisdictionJsonLd(view.jurisdiction.name, view.parentName)} />
      <JurisdictionTemplate
        breadcrumb={[
          { label: "World", href: atlasRoutes.home },
          ...view.ancestors.map((ancestor) => ({
            label: ancestor.name,
            href: jurisdictionPublicPath(ancestor.slugPath),
          })),
          { label: view.jurisdiction.name },
        ]}
        name={view.jurisdiction.name}
        level={level}
        facts={facts}
        nextElection={
          view.nextElectionLabel ? { label: view.nextElectionLabel } : upcomingElections ? undefined : null
        }
        upcomingElections={upcomingElections}
        places={filteredPlaces.map(toChild)}
        placeFilter={
          useServerFilter
            ? {
                q,
                kind,
                kinds,
                path: pathName,
                show: view.children.length > 12 || q.length > 0 || kind.length > 0,
                date: date || undefined,
              }
            : undefined
        }
        map={
          topojsonUrl ? (
            <DynamicJurisdictionMap
              parentLevel={view.jurisdiction.levelLabel}
              topojsonUrl={topojsonUrl}
              attribution={attributionForCountry(view.jurisdiction.countryId)}
              asOfYear={new Date().getUTCFullYear()}
              places={mapPlaces}
            />
          ) : undefined
        }
        seats={paged.items.map(toSeat)}
        seatsEmptyTitle={date ? "No seats on this date" : undefined}
        seatPagination={datedSeats.length > 0 ? <Pagination result={paged} params={query} /> : null}
        cycles={cycles}
      />
    </>
  );
}

import { loadObservatoryDataset } from "./research";
import { syntheticFixtureDataset } from "@/data/normalized/synthetic-fixture-v0";
import type {
  CountryRecord,
  ElectionEvent,
  NormalizedDataset,
  OfficeRecord,
} from "@/schemas/v1/normalized";
import type { ExplorerFilterState } from "@/lib/observatory/filters";
import { researchDateSortKey } from "@/lib/observatory/dates";

let cached: NormalizedDataset | undefined;
export function getDataset(): NormalizedDataset {
  if (
    process.env.OBSERVATORY_FIXTURES === "1" &&
    process.env.NODE_ENV !== "production"
  )
    return syntheticFixtureDataset;
  return (cached ??= loadObservatoryDataset());
}
let lookupCache: ReturnType<typeof makeLookups> | undefined;
function grouped<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    const a = m.get(k) || [];
    a.push(r);
    m.set(k, a);
  }
  return m;
}
function makeLookups() {
  const d = getDataset();
  return {
    offices: new Map(d.offices.map((o) => [o.id, o])),
    countries: new Map(d.countries.map((o) => [o.id, o])),
    geographies: new Map(d.geographies.map((o) => [o.id, o])),
    events: new Map(d.events.map((o) => [o.id, o])),
    histories: new Map(d.events.map((o) => [o.historyKey, o])),
    metrics: grouped(d.metrics, (o) => o.officeId),
    officeEvents: grouped(d.events, (o) => o.officeId),
    holders: grouped(d.officeholders, (o) => o.officeId),
    registers: grouped(d.registers, (o) => o.officeId || ""),
    polls: grouped(d.polls, (o) => o.officeId || ""),
    sources: new Map(d.sources.map((o) => [o.id, o])),
    proceedings: grouped(d.proceedings, (o) => o.eventId),
  };
}
const lookups = () => (lookupCache ??= makeLookups());

export function isFixtureOnlyDataset(): boolean {
  return getDataset().release.provenance.kind === "synthetic_fixture";
}

export function researchCoverageComplete(): false {
  return false;
}

export function getRegions() {
  return getDataset().regions;
}

export function getDefaultRegion() {
  return (
    getDataset().regions.find((region) => region.isDefaultLanding) ??
    getDataset().regions[0]
  );
}

export function getCountries() {
  return getDataset().countries;
}

export function getCountry(id: string): CountryRecord | undefined {
  return lookups().countries.get(id);
}

export function getOffices() {
  return getDataset().offices;
}

export function getOffice(id: string): OfficeRecord | undefined {
  return lookups().offices.get(id);
}

export function getCurrentOffices() {
  return getDataset().offices.filter((office) => office.status === "current");
}

export function getEvents() {
  return getDataset().events;
}

export function getEvent(id: string): ElectionEvent | undefined {
  return lookups().events.get(id);
}

export function eventsForOffice(officeId: string) {
  return lookups().officeEvents.get(officeId) ?? [];
}

export function selectedEventsForOffice(officeId: string) {
  const office = getOffice(officeId);
  if (!office) return [];
  return office.selectedHistoryKeys
    .map((key) => lookups().histories.get(key))
    .filter((event): event is ElectionEvent => Boolean(event));
}

export function otherEventsForOffice(officeId: string) {
  return eventsForOffice(officeId).filter(
    (event) => event.selectedHistoryRole === "other",
  );
}

export function upcomingEvents() {
  return getDataset()
    .events.filter((event) => event.selectedHistoryRole === "none")
    .slice()
    .sort((a, b) => researchDateSortKey(a.date) - researchDateSortKey(b.date));
}

export function getGeography(id: string) {
  return lookups().geographies.get(id);
}

export function metricsForOffice(officeId: string) {
  return lookups().metrics.get(officeId) ?? [];
}

export function pollsForOffice(officeId: string) {
  return lookups().polls.get(officeId) ?? [];
}

export function nationalPolls(countryId?: string) {
  return getDataset().polls.filter(
    (poll) =>
      poll.scope === "national" && (!countryId || poll.countryId === countryId),
  );
}

export function officeholdersForOffice(officeId: string) {
  return lookups().holders.get(officeId) ?? [];
}

export function issuesForRecord(recordId: string) {
  return getDataset().issues.filter((issue) =>
    issue.affectedRecordIds.includes(recordId),
  );
}

export function sourcesByIds(ids: string[]) {
  return [...new Set(ids)].flatMap((id) => {
    const s = lookups().sources.get(id);
    return s ? [s] : [];
  });
}

export function sourceById(id: string) {
  return lookups().sources.get(id);
}

export function proceedingsForEvent(eventId: string) {
  return lookups().proceedings.get(eventId) ?? [];
}

export function registersForOffice(officeId: string) {
  return lookups().registers.get(officeId) ?? [];
}

function includesInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function filterOffices(filters: ExplorerFilterState): OfficeRecord[] {
  const dataset = getDataset();
  return dataset.offices.filter((office) => {
    const country = getCountry(office.countryId);
    const region = dataset.regions.find((row) => row.id === country?.regionId);
    const geo = getGeography(office.geographyId);
    const next = office.nextElection?.date;
    const officeMetrics = metricsForOffice(office.id);

    if (filters.officeStatus && office.status !== filters.officeStatus)
      return false;
    if (filters.q) {
      const blob = `${office.id} ${office.names.official} ${office.names.short} ${country?.names.official ?? ""} ${geo?.names.official ?? ""}`;
      if (!includesInsensitive(blob, filters.q)) return false;
    }
    if (filters.region && region?.id !== filters.region) return false;
    if (filters.country && office.countryId !== filters.country) return false;
    if (filters.area && office.geographyId !== filters.area) return false;
    if (filters.tier && office.tier !== filters.tier) return false;
    if (filters.officeType && office.officeType !== filters.officeType)
      return false;
    if (filters.dateCertainty && next?.certainty !== filters.dateCertainty)
      return false;
    if ((filters.dateFrom || filters.dateTo) && next?.year == null)
      return false;
    if (
      filters.dateFrom &&
      next?.year != null &&
      next.year < Number(filters.dateFrom)
    )
      return false;
    if (
      filters.dateTo &&
      next?.year != null &&
      next.year > Number(filters.dateTo)
    )
      return false;
    if (filters.evidenceStatus) {
      const events = eventsForOffice(office.id);
      const match = events.some((event) =>
        event.resultRows.some(
          (row) => row.evidenceStatus === filters.evidenceStatus,
        ),
      );
      if (!match) return false;
    }
    if (
      filters.metricAvailability === "available" &&
      officeMetrics.every((m) => m.value.value == null)
    ) {
      return false;
    }
    if (
      filters.metricAvailability === "unavailable" &&
      officeMetrics.some((m) => m.value.value != null)
    ) {
      return false;
    }
    if (
      filters.metricReview &&
      !officeMetrics.some((m) => m.reviewStatus === filters.metricReview)
    ) {
      return false;
    }
    return true;
  });
}

export function compareCompatibility(officeIds: string[]): string[] {
  const offices = officeIds
    .map((id) => getOffice(id))
    .filter((office): office is OfficeRecord => Boolean(office));
  const notes: string[] = [];
  const tiers = new Set(offices.map((office) => office.tier));
  if (tiers.size > 1) {
    notes.push(
      "These offices sit at different government tiers. Treat vote and seat comparisons as illustrative only.",
    );
  }
  const bases = new Set(
    officeIds.flatMap((id) =>
      selectedEventsForOffice(id).map((event) => event.ballotBasis),
    ),
  );
  if (bases.size > 1) {
    notes.push(
      "Selected histories use different ballot bases. Do not compare shares as if they share a denominator.",
    );
  }
  const units = new Set(
    officeIds.flatMap((id) =>
      selectedEventsForOffice(id).map((event) => event.voteShareUnit),
    ),
  );
  if (units.size > 1) {
    notes.push(
      "Share units differ (percent vs proportion). Convert explicitly before comparing.",
    );
  }
  if (
    offices.some((office) =>
      metricsForOffice(office.id).some((m) => m.reviewStatus !== "cleared"),
    )
  ) {
    notes.push(
      "At least one office lacks a cleared metric. Provisional and ineligible values stay labelled as such.",
    );
  }
  return notes;
}

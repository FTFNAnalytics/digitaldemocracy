import { syntheticFixtureDataset } from "@/data/normalized/synthetic-fixture-v0";
import type {
  CountryRecord,
  ElectionEvent,
  NormalizedDataset,
  OfficeRecord,
} from "@/schemas/v1/normalized";
import type { ExplorerFilterState } from "@/lib/observatory/filters";
import { researchDateSortKey } from "@/lib/observatory/dates";

export function getDataset(): NormalizedDataset {
  return syntheticFixtureDataset;
}

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
  return getDataset().regions.find((region) => region.isDefaultLanding) ?? getDataset().regions[0];
}

export function getCountries() {
  return getDataset().countries;
}

export function getCountry(id: string): CountryRecord | undefined {
  return getDataset().countries.find((country) => country.id === id);
}

export function getOffices() {
  return getDataset().offices;
}

export function getOffice(id: string): OfficeRecord | undefined {
  return getDataset().offices.find((office) => office.id === id);
}

export function getCurrentOffices() {
  return getDataset().offices.filter((office) => office.status === "current");
}

export function getEvents() {
  return getDataset().events;
}

export function getEvent(id: string): ElectionEvent | undefined {
  return getDataset().events.find((event) => event.id === id);
}

export function eventsForOffice(officeId: string) {
  return getDataset().events.filter((event) => event.officeId === officeId);
}

export function selectedEventsForOffice(officeId: string) {
  const office = getOffice(officeId);
  if (!office) return [];
  return office.selectedHistoryKeys
    .map((key) => getDataset().events.find((event) => event.historyKey === key))
    .filter((event): event is ElectionEvent => Boolean(event));
}

export function otherEventsForOffice(officeId: string) {
  return eventsForOffice(officeId).filter((event) => event.selectedHistoryRole === "other");
}

export function upcomingEvents() {
  return getDataset()
    .events.filter((event) => event.selectedHistoryRole === "none")
    .slice()
    .sort((a, b) => researchDateSortKey(a.date) - researchDateSortKey(b.date));
}

export function getGeography(id: string) {
  return getDataset().geographies.find((geo) => geo.id === id);
}

export function metricsForOffice(officeId: string) {
  return getDataset().metrics.filter((metric) => metric.officeId === officeId);
}

export function pollsForOffice(officeId: string) {
  return getDataset().polls.filter((poll) => poll.officeId === officeId);
}

export function nationalPolls(countryId?: string) {
  return getDataset().polls.filter(
    (poll) => poll.scope === "national" && (!countryId || poll.countryId === countryId),
  );
}

export function officeholdersForOffice(officeId: string) {
  return getDataset().officeholders.filter((row) => row.officeId === officeId);
}

export function issuesForRecord(recordId: string) {
  return getDataset().issues.filter((issue) => issue.affectedRecordIds.includes(recordId));
}

export function sourcesByIds(ids: string[]) {
  const set = new Set(ids);
  return getDataset().sources.filter((source) => set.has(source.id));
}

export function sourceById(id: string) {
  return getDataset().sources.find((source) => source.id === id);
}

export function proceedingsForEvent(eventId: string) {
  return getDataset().proceedings.filter((row) => row.eventId === eventId);
}

export function registersForOffice(officeId: string) {
  return getDataset().registers.filter((row) => row.officeId === officeId);
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

    if (filters.officeStatus && office.status !== filters.officeStatus) return false;
    if (filters.q) {
      const blob = `${office.id} ${office.names.official} ${office.names.short} ${country?.names.official ?? ""} ${geo?.names.official ?? ""}`;
      if (!includesInsensitive(blob, filters.q)) return false;
    }
    if (filters.region && region?.id !== filters.region) return false;
    if (filters.country && office.countryId !== filters.country) return false;
    if (filters.area && office.geographyId !== filters.area) return false;
    if (filters.tier && office.tier !== filters.tier) return false;
    if (filters.officeType && office.officeType !== filters.officeType) return false;
    if (filters.dateCertainty && next?.certainty !== filters.dateCertainty) return false;
    if (filters.dateFrom && next?.year != null && next.year < Number(filters.dateFrom)) return false;
    if (filters.dateTo && next?.year != null && next.year > Number(filters.dateTo)) return false;
    if (filters.evidenceStatus) {
      const events = eventsForOffice(office.id);
      const match = events.some((event) =>
        event.resultRows.some((row) => row.evidenceStatus === filters.evidenceStatus),
      );
      if (!match) return false;
    }
    if (filters.metricAvailability === "available" && officeMetrics.every((m) => m.value.value == null)) {
      return false;
    }
    if (filters.metricAvailability === "unavailable" && officeMetrics.some((m) => m.value.value != null)) {
      return false;
    }
    if (filters.metricReview && !officeMetrics.some((m) => m.reviewStatus === filters.metricReview)) {
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
    notes.push("These offices sit at different government tiers. Treat vote and seat comparisons as illustrative only.");
  }
  const bases = new Set(
    officeIds.flatMap((id) =>
      selectedEventsForOffice(id).map((event) => event.ballotBasis),
    ),
  );
  if (bases.size > 1) {
    notes.push("Selected histories use different ballot bases. Do not compare shares as if they share a denominator.");
  }
  const units = new Set(
    officeIds.flatMap((id) =>
      selectedEventsForOffice(id).map((event) => event.voteShareUnit),
    ),
  );
  if (units.size > 1) {
    notes.push("Share units differ (percent vs proportion). Convert explicitly before comparing.");
  }
  if (offices.some((office) => metricsForOffice(office.id).some((m) => m.reviewStatus !== "cleared"))) {
    notes.push("At least one office lacks a cleared metric. Provisional and ineligible values stay labelled as such.");
  }
  return notes;
}

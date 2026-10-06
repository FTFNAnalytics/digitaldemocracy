import { assignOfficeSlugs, type OfficeSlugAlias, type OfficeSlugMeanings, type OfficeSlugRow } from "../seat/slug";
import { cycleKey, cycleLabel, lowestCommonAncestor, placeEvent } from "./cycle";
import { classifyJurisdictionLevel } from "./level";
import { deriveSeatStatus, pickLatestSelectedEvent, type ResultFacts, type SelectedEventFacts } from "./seat";
import { assignSlugs, type PublishedSlugMeanings, type SlugAlias, type SlugNode } from "./slug";

export type CountryInput = {
  countryId: string;
  name: string;
  coverageStatus: string;
};

export type GeographyInput = {
  countryId: string;
  geographyId: string;
  name: string;
  parentGeographyId: string | null;
};

export type OfficeInput = {
  idNamespace: string;
  officeId: string;
  countryId: string;
  geographyId: string;
  name: string;
  officeType: string;
  nextDateId: string | null;
  nextDateResolution: string;
  tier: string | null;
  lineageId: string;
};

export type EventInput = {
  idNamespace: string;
  officeId: string;
  historyKey: string;
  eventId: string;
  countryId: string;
  geographyId: string;
  tier: string | null;
  dateId: string | null;
  dateResolution: string;
  eventKind: string;
  selectedHistoryRole: string;
  legalOutcome: string;
  recordState: string;
  precision: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
};

export type ResultInput = ResultFacts & {
  idNamespace: string;
  officeId: string;
  historyKey: string;
};

export type SnapshotInput = {
  countryId: string;
  label: string | null;
};

export type MasterSnapshot = {
  countries: CountryInput[];
  geographies: GeographyInput[];
  offices: OfficeInput[];
  events: EventInput[];
  results: ResultInput[];
  snapshots: SnapshotInput[];
};

export type JurisdictionRow = {
  jurisdiction_key: string;
  country_id: string;
  geography_id: string | null;
  parent_key: string | null;
  depth: number;
  level_label: string;
  name: string;
  slug: string;
  slug_path: string;
  office_count: number;
  event_count: number;
  first_event_year: number | null;
  last_event_year: number | null;
  coverage_status: string;
  ambiguous: number;
};

export type SeatRow = {
  id_namespace: string;
  office_id: string;
  country_id: string;
  current_holder_label: string | null;
  current_holder_party_label: string | null;
  current_since_date_id: string | null;
  last_selected_event_id: string | null;
  last_share: number | null;
  last_share_unit: string | null;
  last_margin: number | null;
  next_date_id: string | null;
  status_reason: string | null;
};

export type CycleRow = {
  cycle_key: string;
  country_id: string;
  date_id: string;
  iso_date: string;
  contest_count: number;
  scope_key: string;
  tiers_json: string;
  kinds_json: string;
  label: string;
};

export type UnplacedRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  country_id: string;
  year: number | null;
  date_id: string | null;
  date_precision: string | null;
  date_resolution: string;
};

export type CoverageRow = {
  jurisdiction_key: string;
  offices: number;
  offices_with_any_event: number;
  offices_with_results: number;
  events_total: number;
  events_with_results: number;
  not_supplied_next_dates: number;
  latest_snapshot_label: string | null;
};

export type DerivedProjection = {
  jurisdictions: JurisdictionRow[];
  aliases: Array<{ slug_path: string; jurisdiction_key: string; reason: string }>;
  seats: SeatRow[];
  officeSlugs: OfficeSlugRow[];
  officeSlugAliases: OfficeSlugAlias[];
  cycles: CycleRow[];
  unplaced: UnplacedRow[];
  coverage: CoverageRow[];
};

export function countryJurisdictionKey(countryId: string): string {
  return `country:${countryId}`;
}

export function geographyJurisdictionKey(countryId: string, geographyId: string): string {
  return `geo:${countryId}:${geographyId}`;
}

type GeoNode = {
  countryId: string;
  geographyId: string;
  name: string;
  parentGeographyId: string | null;
  key: string;
  parentKey: string;
  depth: number;
};

type Rollup = {
  offices: number;
  officesWithAnyEvent: number;
  officesWithResults: number;
  events: number;
  eventsWithResults: number;
  notSuppliedNextDates: number;
  firstYear: number | null;
  lastYear: number | null;
};

function officeKey(idNamespace: string, officeId: string): string {
  return `${idNamespace}\n${officeId}`;
}

function eventKey(idNamespace: string, officeId: string, historyKey: string): string {
  return `${idNamespace}\n${officeId}\n${historyKey}`;
}

function considerYear(current: number | null, year: number | null, pick: "min" | "max"): number | null {
  if (year == null) return current;
  if (current == null) return year;
  return pick === "min" ? Math.min(current, year) : Math.max(current, year);
}

function sortedJson(values: Array<string | null>): string {
  const unique = [...new Set(values.filter((value): value is string => value != null && value !== ""))].sort((a, b) =>
    a.localeCompare(b),
  );
  return JSON.stringify(unique);
}

export function projectDerived(
  master: MasterSnapshot,
  prior: PublishedSlugMeanings,
  officePrior: OfficeSlugMeanings,
): DerivedProjection {
  const countryById = new Map(master.countries.map((country) => [country.countryId, country]));
  const geosByCountry = new Map<string, GeographyInput[]>();
  for (const geography of master.geographies) {
    const list = geosByCountry.get(geography.countryId) ?? [];
    list.push(geography);
    geosByCountry.set(geography.countryId, list);
  }

  const officesByGeo = new Map<string, OfficeInput[]>();
  const officesByCountry = new Map<string, OfficeInput[]>();
  for (const office of master.offices) {
    const geoKey = `${office.countryId}\n${office.geographyId}`;
    const list = officesByGeo.get(geoKey) ?? [];
    list.push(office);
    officesByGeo.set(geoKey, list);
    const countryOffices = officesByCountry.get(office.countryId) ?? [];
    countryOffices.push(office);
    officesByCountry.set(office.countryId, countryOffices);
  }

  const eventsByOffice = new Map<string, EventInput[]>();
  for (const event of master.events) {
    const key = officeKey(event.idNamespace, event.officeId);
    const list = eventsByOffice.get(key) ?? [];
    list.push(event);
    eventsByOffice.set(key, list);
  }

  const resultsByEvent = new Map<string, ResultInput[]>();
  const eventsWithResults = new Set<string>();
  for (const result of master.results) {
    const key = eventKey(result.idNamespace, result.officeId, result.historyKey);
    const list = resultsByEvent.get(key) ?? [];
    list.push(result);
    resultsByEvent.set(key, list);
    eventsWithResults.add(key);
  }

  const snapshotByCountry = new Map(master.snapshots.map((row) => [row.countryId, row.label]));

  const jurisdictions: JurisdictionRow[] = [];
  const slugNodes: SlugNode[] = [];
  const pathByKey = new Map<string, string[]>();
  const jurisdictionByGeo = new Map<string, string>();

  const countryIds = [...countryById.keys()].sort((a, b) => a.localeCompare(b));
  for (const countryId of countryIds) {
    const country = countryById.get(countryId)!;
    const nodes = buildGeoNodes(countryId, geosByCountry.get(countryId) ?? []);
    const children = new Map<string, string[]>();
    for (const node of nodes) {
      const parentGeo = node.parentGeographyId ?? "";
      const list = children.get(parentGeo) ?? [];
      list.push(node.geographyId);
      children.set(parentGeo, list);
    }
    const directTiers = new Map<string, Array<string | null>>();
    for (const node of nodes) {
      const offices = officesByGeo.get(`${countryId}\n${node.geographyId}`) ?? [];
      directTiers.set(
        node.geographyId,
        offices.map((office) => office.tier),
      );
    }
    const descendantMemo = new Map<string, Array<string | null>>();
    const visiting = new Set<string>();
    const descendantTiers = (geographyId: string): Array<string | null> => {
      const cached = descendantMemo.get(geographyId);
      if (cached) return cached;
      if (visiting.has(geographyId)) throw new Error(`Geography cycle at ${countryId}/${geographyId}`);
      visiting.add(geographyId);
      const tiers: Array<string | null> = [];
      for (const child of children.get(geographyId) ?? []) {
        tiers.push(...(directTiers.get(child) ?? []));
        tiers.push(...descendantTiers(child));
      }
      visiting.delete(geographyId);
      descendantMemo.set(geographyId, tiers);
      return tiers;
    };

    const rollMemo = new Map<string, Rollup>();
    const rollup = (geographyId: string): Rollup => {
      const cached = rollMemo.get(geographyId);
      if (cached) return cached;
      const direct = directRollup(officesByGeo.get(`${countryId}\n${geographyId}`) ?? [], eventsByOffice, eventsWithResults);
      for (const child of children.get(geographyId) ?? []) {
        const childRoll = rollup(child);
        direct.offices += childRoll.offices;
        direct.officesWithAnyEvent += childRoll.officesWithAnyEvent;
        direct.officesWithResults += childRoll.officesWithResults;
        direct.events += childRoll.events;
        direct.eventsWithResults += childRoll.eventsWithResults;
        direct.notSuppliedNextDates += childRoll.notSuppliedNextDates;
        direct.firstYear = considerYear(direct.firstYear, childRoll.firstYear, "min");
        direct.lastYear = considerYear(direct.lastYear, childRoll.lastYear, "max");
      }
      rollMemo.set(geographyId, direct);
      return direct;
    };

    const countryKey = countryJurisdictionKey(countryId);
    pathByKey.set(countryKey, [countryKey]);
    const countryRoll = emptyRollup();
    for (const rootId of children.get("") ?? []) {
      const rootRoll = rollup(rootId);
      countryRoll.offices += rootRoll.offices;
      countryRoll.officesWithAnyEvent += rootRoll.officesWithAnyEvent;
      countryRoll.officesWithResults += rootRoll.officesWithResults;
      countryRoll.events += rootRoll.events;
      countryRoll.eventsWithResults += rootRoll.eventsWithResults;
      countryRoll.notSuppliedNextDates += rootRoll.notSuppliedNextDates;
      countryRoll.firstYear = considerYear(countryRoll.firstYear, rootRoll.firstYear, "min");
      countryRoll.lastYear = considerYear(countryRoll.lastYear, rootRoll.lastYear, "max");
    }

    slugNodes.push({
      jurisdictionKey: countryKey,
      parentKey: null,
      depth: 0,
      countryId,
      name: country.name,
      slug: "",
      slugPath: "",
    });

    const countryRow: JurisdictionRow = {
      jurisdiction_key: countryKey,
      country_id: countryId,
      geography_id: null,
      parent_key: null,
      depth: 0,
      level_label: "country",
      name: country.name,
      slug: "",
      slug_path: "",
      office_count: countryRoll.offices,
      event_count: countryRoll.events,
      first_event_year: countryRoll.firstYear,
      last_event_year: countryRoll.lastYear,
      coverage_status: country.coverageStatus,
      ambiguous: 0,
    };
    jurisdictions.push(countryRow);

    const orderedNodes = [...nodes].sort((a, b) => a.depth - b.depth || a.geographyId.localeCompare(b.geographyId));
    for (const node of orderedNodes) {
      const level = classifyJurisdictionLevel({
        isCountry: false,
        depth: node.depth,
        directTiers: directTiers.get(node.geographyId) ?? [],
        descendantTiers: descendantTiers(node.geographyId),
      });
      const roll = rollup(node.geographyId);
      const parentPath = pathByKey.get(node.parentKey) ?? [countryKey];
      pathByKey.set(node.key, [...parentPath, node.key]);
      jurisdictionByGeo.set(`${countryId}\n${node.geographyId}`, node.key);
      slugNodes.push({
        jurisdictionKey: node.key,
        parentKey: node.parentKey,
        depth: node.depth,
        countryId,
        name: node.name,
        slug: "",
        slugPath: "",
      });
      jurisdictions.push({
        jurisdiction_key: node.key,
        country_id: countryId,
        geography_id: node.geographyId,
        parent_key: node.parentKey,
        depth: node.depth,
        level_label: level.levelLabel,
        name: node.name,
        slug: "",
        slug_path: "",
        office_count: roll.offices,
        event_count: roll.events,
        first_event_year: roll.firstYear,
        last_event_year: roll.lastYear,
        coverage_status: country.coverageStatus,
        ambiguous: level.ambiguous,
      });
    }
  }

  const aliases = assignSlugs(slugNodes, prior);
  const slugByKey = new Map(slugNodes.map((node) => [node.jurisdictionKey, node]));
  for (const row of jurisdictions) {
    const slug = slugByKey.get(row.jurisdiction_key);
    if (!slug || !slug.slugPath) throw new Error(`Missing slug for ${row.jurisdiction_key}`);
    row.slug = slug.slug;
    row.slug_path = slug.slugPath;
  }

  const coverage = buildCoverage(
    jurisdictions,
    officesByGeo,
    eventsByOffice,
    eventsWithResults,
    snapshotByCountry,
  );
  const seats = deriveSeats(master.offices, eventsByOffice, resultsByEvent);
  const { cycles, unplaced } = deriveCycles(master.events, countryById, jurisdictionByGeo, pathByKey);
  const slugPathByJurisdiction = new Map(jurisdictions.map((row) => [row.jurisdiction_key, row.slug_path]));
  const officeSlugs = assignOfficeSlugs(
    master.offices.map((office) => {
      const jurisdictionKey = jurisdictionByGeo.get(`${office.countryId}\n${office.geographyId}`);
      const jurisdictionSlugPath = jurisdictionKey ? slugPathByJurisdiction.get(jurisdictionKey) : undefined;
      if (!jurisdictionKey || !jurisdictionSlugPath) {
        throw new Error(`No jurisdiction slug for office ${office.idNamespace}/${office.officeId}`);
      }
      return {
        idNamespace: office.idNamespace,
        officeId: office.officeId,
        name: office.name,
        jurisdictionKey,
        jurisdictionSlugPath,
      };
    }),
    officePrior,
  );

  return {
    jurisdictions: sortJurisdictions(jurisdictions),
    aliases: sortAliases(aliases),
    seats,
    officeSlugs: officeSlugs.rows,
    officeSlugAliases: officeSlugs.aliases,
    cycles,
    unplaced,
    coverage,
  };
}

function sortJurisdictions(rows: JurisdictionRow[]): JurisdictionRow[] {
  return [...rows].sort((a, b) => a.jurisdiction_key.localeCompare(b.jurisdiction_key));
}

function sortAliases(rows: SlugAlias[]): Array<{ slug_path: string; jurisdiction_key: string; reason: string }> {
  return [...rows]
    .sort((a, b) => a.slugPath.localeCompare(b.slugPath))
    .map((row) => ({ slug_path: row.slugPath, jurisdiction_key: row.jurisdictionKey, reason: row.reason }));
}

function buildGeoNodes(countryId: string, geographies: GeographyInput[]): GeoNode[] {
  const byId = new Map(geographies.map((geography) => [geography.geographyId, geography]));
  const depthMemo = new Map<string, number>();
  const depthOf = (geographyId: string, stack: string[]): number => {
    const cached = depthMemo.get(geographyId);
    if (cached != null) return cached;
    if (stack.includes(geographyId)) throw new Error(`Geography cycle at ${countryId}/${geographyId}`);
    const geography = byId.get(geographyId);
    if (!geography) throw new Error(`Missing geography ${countryId}/${geographyId}`);
    const depth =
      geography.parentGeographyId == null ? 1 : depthOf(geography.parentGeographyId, [...stack, geographyId]) + 1;
    depthMemo.set(geographyId, depth);
    return depth;
  };
  return geographies.map((geography) => {
    const depth = depthOf(geography.geographyId, []);
    const parentKey =
      geography.parentGeographyId == null
        ? countryJurisdictionKey(countryId)
        : geographyJurisdictionKey(countryId, geography.parentGeographyId);
    return {
      countryId,
      geographyId: geography.geographyId,
      name: geography.name,
      parentGeographyId: geography.parentGeographyId,
      key: geographyJurisdictionKey(countryId, geography.geographyId),
      parentKey,
      depth,
    };
  });
}

function emptyRollup(): Rollup {
  return {
    offices: 0,
    officesWithAnyEvent: 0,
    officesWithResults: 0,
    events: 0,
    eventsWithResults: 0,
    notSuppliedNextDates: 0,
    firstYear: null,
    lastYear: null,
  };
}

function directRollup(
  offices: OfficeInput[],
  eventsByOffice: Map<string, EventInput[]>,
  eventsWithResults: Set<string>,
): Rollup {
  const roll = emptyRollup();
  for (const office of offices) {
    roll.offices += 1;
    if (office.nextDateResolution === "unknown") roll.notSuppliedNextDates += 1;
    const events = eventsByOffice.get(officeKey(office.idNamespace, office.officeId)) ?? [];
    if (events.length > 0) roll.officesWithAnyEvent += 1;
    let officeHasResults = false;
    for (const event of events) {
      roll.events += 1;
      roll.firstYear = considerYear(roll.firstYear, event.year, "min");
      roll.lastYear = considerYear(roll.lastYear, event.year, "max");
      if (eventsWithResults.has(eventKey(event.idNamespace, event.officeId, event.historyKey))) {
        roll.eventsWithResults += 1;
        officeHasResults = true;
      }
    }
    if (officeHasResults) roll.officesWithResults += 1;
  }
  return roll;
}

function buildCoverage(
  jurisdictions: JurisdictionRow[],
  officesByGeo: Map<string, OfficeInput[]>,
  eventsByOffice: Map<string, EventInput[]>,
  eventsWithResults: Set<string>,
  snapshotByCountry: Map<string, string | null>,
): CoverageRow[] {
  const children = new Map<string, string[]>();
  const byKey = new Map(jurisdictions.map((row) => [row.jurisdiction_key, row]));
  for (const row of jurisdictions) {
    if (!row.parent_key) continue;
    const list = children.get(row.parent_key) ?? [];
    list.push(row.jurisdiction_key);
    children.set(row.parent_key, list);
  }
  const directByKey = new Map<string, Rollup>();
  for (const row of jurisdictions) {
    if (row.geography_id == null) {
      directByKey.set(row.jurisdiction_key, emptyRollup());
      continue;
    }
    directByKey.set(
      row.jurisdiction_key,
      directRollup(
        officesByGeo.get(`${row.country_id}\n${row.geography_id}`) ?? [],
        eventsByOffice,
        eventsWithResults,
      ),
    );
  }
  const memo = new Map<string, Rollup>();
  const total = (key: string): Rollup => {
    const cached = memo.get(key);
    if (cached) return cached;
    const roll = { ...(directByKey.get(key) ?? emptyRollup()) };
    for (const child of children.get(key) ?? []) {
      const childRoll = total(child);
      roll.offices += childRoll.offices;
      roll.officesWithAnyEvent += childRoll.officesWithAnyEvent;
      roll.officesWithResults += childRoll.officesWithResults;
      roll.events += childRoll.events;
      roll.eventsWithResults += childRoll.eventsWithResults;
      roll.notSuppliedNextDates += childRoll.notSuppliedNextDates;
      roll.firstYear = considerYear(roll.firstYear, childRoll.firstYear, "min");
      roll.lastYear = considerYear(roll.lastYear, childRoll.lastYear, "max");
    }
    memo.set(key, roll);
    return roll;
  };
  return [...byKey.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const row = byKey.get(key)!;
      const roll = total(key);
      if (roll.offices !== row.office_count || roll.events !== row.event_count) {
        throw new Error(`Coverage rollup drifted for ${key}`);
      }
      return {
        jurisdiction_key: key,
        offices: roll.offices,
        offices_with_any_event: roll.officesWithAnyEvent,
        offices_with_results: roll.officesWithResults,
        events_total: roll.events,
        events_with_results: roll.eventsWithResults,
        not_supplied_next_dates: roll.notSuppliedNextDates,
        latest_snapshot_label: snapshotByCountry.get(row.country_id) ?? null,
      };
    });
}

function deriveSeats(
  offices: OfficeInput[],
  eventsByOffice: Map<string, EventInput[]>,
  resultsByEvent: Map<string, ResultInput[]>,
): SeatRow[] {
  return [...offices]
    .sort((a, b) => a.idNamespace.localeCompare(b.idNamespace) || a.officeId.localeCompare(b.officeId))
    .map((office) => {
      const events = eventsByOffice.get(officeKey(office.idNamespace, office.officeId)) ?? [];
      const selected = events.filter((event) => event.selectedHistoryRole === "selected");
      const latest = resultsForSelected(selected, resultsByEvent);
      const status = deriveSeatStatus({
        officeType: office.officeType,
        nextDateId: office.nextDateId,
        nextDateResolution: office.nextDateResolution,
        selectedEvents: selected.map(toSelected),
        results: latest,
      });
      return {
        id_namespace: office.idNamespace,
        office_id: office.officeId,
        country_id: office.countryId,
        current_holder_label: status.currentHolderLabel,
        current_holder_party_label: status.currentHolderPartyLabel,
        current_since_date_id: status.currentSinceDateId,
        last_selected_event_id: status.lastSelectedEventId,
        last_share: status.lastShare,
        last_share_unit: status.lastShareUnit,
        last_margin: status.lastMargin,
        next_date_id: status.nextDateId,
        status_reason: status.statusReason,
      };
    });
}

function toSelected(event: EventInput): SelectedEventFacts {
  return {
    eventId: event.eventId,
    historyKey: event.historyKey,
    dateId: event.dateId,
    dateResolution: event.dateResolution,
    precision: event.precision,
    year: event.year,
    month: event.month,
    day: event.day,
    legalOutcome: event.legalOutcome,
    recordState: event.recordState,
  };
}

function resultsForSelected(selected: EventInput[], resultsByEvent: Map<string, ResultInput[]>): ResultInput[] {
  const latest = pickLatestSelectedEvent(selected.map(toSelected));
  if (latest.kind !== "one") return [];
  const event = selected.find((row) => row.eventId === latest.event.eventId);
  if (!event) return [];
  return resultsByEvent.get(eventKey(event.idNamespace, event.officeId, event.historyKey)) ?? [];
}

function deriveCycles(
  events: EventInput[],
  countryById: Map<string, CountryInput>,
  jurisdictionByGeo: Map<string, string>,
  pathByKey: Map<string, string[]>,
): { cycles: CycleRow[]; unplaced: UnplacedRow[] } {
  const placed = new Map<string, EventInput[]>();
  const unplaced: UnplacedRow[] = [];
  for (const event of events) {
    const placement = placeEvent({
      dateResolution: event.dateResolution,
      precision: event.precision,
      year: event.year,
      month: event.month,
      day: event.day,
    });
    if (!placement.placed) {
      unplaced.push({
        id_namespace: event.idNamespace,
        office_id: event.officeId,
        history_key: event.historyKey,
        country_id: event.countryId,
        year: placement.year,
        date_id: event.dateId,
        date_precision: event.precision,
        date_resolution: event.dateResolution,
      });
      continue;
    }
    const key = `${event.countryId}\n${placement.isoDate}`;
    const list = placed.get(key) ?? [];
    list.push(event);
    placed.set(key, list);
  }

  const cycles: CycleRow[] = [];
  const keys = [...placed.keys()].sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    const group = placed.get(key) ?? [];
    const [countryId, isoDate] = key.split("\n");
    if (!countryId || !isoDate) throw new Error(`Bad cycle key ${key}`);
    const country = countryById.get(countryId);
    if (!country) throw new Error(`Cycle country ${countryId} is missing`);
    const dateIds = [...new Set(group.map((event) => event.dateId).filter((id): id is string => id != null))].sort(
      (a, b) => a.localeCompare(b),
    );
    const dateId = dateIds[0];
    if (!dateId) throw new Error(`Resolved day ${isoDate} in ${countryId} has no date_id`);
    const paths = group.map((event) => {
      const jurisdiction = jurisdictionByGeo.get(`${event.countryId}\n${event.geographyId}`);
      if (!jurisdiction) throw new Error(`No jurisdiction for ${event.countryId}/${event.geographyId}`);
      const path = pathByKey.get(jurisdiction);
      if (!path) throw new Error(`No jurisdiction path for ${jurisdiction}`);
      return path;
    });
    const tiers = sortedJson(group.map((event) => event.tier));
    const kinds = sortedJson(group.map((event) => event.eventKind));
    const tierList = JSON.parse(tiers) as string[];
    cycles.push({
      cycle_key: cycleKey(countryId, isoDate),
      country_id: countryId,
      date_id: dateId,
      iso_date: isoDate,
      contest_count: group.length,
      scope_key: lowestCommonAncestor(paths),
      tiers_json: tiers,
      kinds_json: kinds,
      label: cycleLabel({
        isoDate,
        countryName: country.name,
        contestCount: group.length,
        tiers: tierList,
      }),
    });
  }

  unplaced.sort(
    (a, b) =>
      a.country_id.localeCompare(b.country_id) ||
      a.id_namespace.localeCompare(b.id_namespace) ||
      a.office_id.localeCompare(b.office_id) ||
      a.history_key.localeCompare(b.history_key),
  );
  return { cycles, unplaced };
}

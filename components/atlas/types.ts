/**
 * Placeholder shapes for the Atlas reading surface.
 * Derived tables arrive with OV-01; these types stay local to components.
 */

export type AtlasCoverageSnapshot = {
  offices: number | null;
  officesWithAnyEvent: number | null;
  officesWithResults: number | null;
  eventsTotal: number | null;
  eventsWithResults: number | null;
  notSuppliedNextDates: number | null;
  latestSnapshotLabel: string | null;
};

export type JurisdictionChild = {
  id: string;
  name: string;
  href: string;
  level: string;
  kind: string | null;
  coverage: AtlasCoverageSnapshot | null;
  seatsTracked?: number | null;
  firstEventYear?: number | null;
  lastEventYear?: number | null;
  nextDateId?: string | null;
  nextYear?: number | null;
  turnout?: number | null;
  margin?: number | null;
  marginUnit?: string | null;
};

export type SeatRow = {
  id: string;
  name: string;
  href: string;
  heldBy: string | null;
  since: string | null;
  lastResult: string | null;
};

export type CycleChip = {
  id: string;
  year: string;
  href: string;
  hasResults: boolean;
  label: string;
};

export type ResultBarRow = {
  id: string;
  label: string | null;
  labelHref?: string | null;
  partyLabel: string | null;
  votes: number | null;
  votesStatus: string;
  share: number | null;
  shareStatus: string;
  seats: number | null;
  seatsStatus: string;
  elected: boolean;
  evidenceStatus: string;
};

export type Crumb = {
  label: string;
  href?: string;
};

export type HeaderFact = {
  label: string;
  value: string;
};

import { Breadcrumb } from "./breadcrumb";
import { CoverageBar, CoverageChip } from "./coverage";
import { EmptyState } from "./empty-state";
import { JurisdictionTemplate } from "./jurisdiction-template";
import { PageHeader } from "./page-header";
import { ProvenanceFooter } from "./provenance-footer";
import { RecordDetails } from "./record-details";
import { ResultsTable } from "./results-table";
import type { AtlasCoverageSnapshot, JurisdictionChild } from "./types";

const recorded: AtlasCoverageSnapshot = {
  offices: 4,
  officesWithAnyEvent: 3,
  officesWithResults: 2,
  eventsTotal: 6,
  eventsWithResults: 4,
  notSuppliedNextDates: 1,
  latestSnapshotLabel: "fixture-snapshot",
};

const queued: AtlasCoverageSnapshot = {
  offices: 4,
  officesWithAnyEvent: 0,
  officesWithResults: 0,
  eventsTotal: 0,
  eventsWithResults: 0,
  notSuppliedNextDates: 4,
  latestSnapshotLabel: null,
};

function fixturePlaces(): JurisdictionChild[] {
  return Array.from({ length: 13 }, (_, index) => {
    const n = index + 1;
    const kind = n % 2 === 0 ? "municipality" : "borough";
    return {
      id: `fixture-place-${n}`,
      name: `Fixture place ${n}`,
      href: "/atlas",
      level: kind,
      kind,
      coverage: n % 3 === 0 ? queued : recorded,
    };
  });
}

export function ReadingKit() {
  return (
    <div className="space-y-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-atlas-accent">Dev kit</p>
        <h1 className="mt-2 font-atlas-heading text-3xl text-atlas-ink">Atlas reading kit</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-atlas-ink-2">
          Component fixtures. These rows are not election records. Public pages keep missing values as not supplied.
        </p>
      </header>

      <section id="breadcrumb" className="space-y-3">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Breadcrumb</h2>
        <Breadcrumb
          items={[
            { label: "World", href: "/atlas" },
            { label: "Fixture country", href: "/atlas" },
            { label: "Fixture region", href: "/atlas" },
            { label: "Fixture municipality" },
          ]}
        />
      </section>

      <section id="page-header">
        <h2 className="mb-3 font-atlas-heading text-2xl text-atlas-ink">Page header</h2>
        <PageHeader
          name="Fixture municipality"
          level="Municipality"
          facts={[
            { label: "Offices", value: "2" },
            { label: "Elections", value: "not supplied" },
          ]}
          nextElection={{ label: "not a real date" }}
        />
      </section>

      <section id="jurisdiction">
        <h2 className="mb-3 font-atlas-heading text-2xl text-atlas-ink">Jurisdiction template</h2>
        <JurisdictionTemplate
          breadcrumb={[
            { label: "World", href: "/atlas" },
            { label: "Fixture country", href: "/atlas" },
            { label: "Fixture region" },
          ]}
          name="Fixture region"
          level="Region"
          facts={[
            { label: "Places", value: "13" },
            { label: "Coverage", value: "Partial results" },
          ]}
          nextElection={null}
          places={fixturePlaces()}
          seats={[
            {
              id: "fixture-seat",
              name: "Fixture seat",
              href: "/atlas",
              heldBy: null,
              since: null,
              lastResult: null,
            },
          ]}
          cycles={[
            { id: "fixture-cycle-a", year: "Fixture year A", href: "/atlas", hasResults: true, label: "Fixture cycle with results" },
            { id: "fixture-cycle-b", year: "Fixture year B", href: "/atlas", hasResults: false, label: "Fixture cycle without results" },
          ]}
        />
      </section>

      <section id="results" className="space-y-3">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Results table</h2>
        <ResultsTable
          caption="Fixture results, not an election record"
          shareUnit="percent_0_100"
          rows={[
            {
              id: "fixture-a",
              label: "Fixture candidate A",
              partyLabel: "Fixture list A",
              votes: 400,
              votesStatus: "recorded",
              share: 40,
              shareStatus: "recorded",
              seats: 1,
              seatsStatus: "recorded",
              elected: true,
              evidenceStatus: "recorded",
            },
            {
              id: "fixture-b",
              label: "Fixture candidate B",
              partyLabel: "Fixture list B",
              votes: 200,
              votesStatus: "recorded",
              share: 20,
              shareStatus: "recorded",
              seats: null,
              seatsStatus: "unknown",
              elected: false,
              evidenceStatus: "recorded",
            },
            {
              id: "fixture-c",
              label: "Fixture candidate C",
              partyLabel: null,
              votes: null,
              votesStatus: "unknown",
              share: 10,
              shareStatus: "recorded",
              seats: null,
              seatsStatus: "unknown",
              elected: false,
              evidenceStatus: "disputed",
            },
          ]}
        />
      </section>

      <section id="coverage" className="space-y-4">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Coverage</h2>
        <div className="flex flex-wrap gap-2">
          <CoverageChip coverage={recorded} />
          <CoverageChip coverage={queued} />
          <CoverageChip coverage={null} storedStatus="not_supplied" />
        </div>
        <CoverageBar coverage={recorded} />
        <CoverageBar coverage={queued} />
        <CoverageBar coverage={null} />
      </section>

      <section id="provenance">
        <h2 className="mb-3 font-atlas-heading text-2xl text-atlas-ink">Provenance</h2>
        <ProvenanceFooter
          publisher="Fixture publisher"
          title="Fixture source title"
          url="https://example.com/atlas-fixture"
          snapshotLabel="fixture-snapshot"
          evidenceGrade="fixture"
          recordId="fixture-record"
        />
        <ProvenanceFooter
          publisher={null}
          title={null}
          url={null}
          snapshotLabel={null}
          evidenceGrade={null}
          recordId="fixture-missing"
        />
      </section>

      <section id="record-details">
        <h2 className="mb-3 font-atlas-heading text-2xl text-atlas-ink">Record details</h2>
        <RecordDetails
          officeId="fixture-office"
          idNamespace="fixture-namespace"
          lineageId="fixture-lineage"
          releaseId="fixture-release"
          historyKey="fixture-history"
        >
          <p>Prompt B identifiers stay inside this collapsed section.</p>
        </RecordDetails>
      </section>

      <section id="empty-states" className="grid gap-4">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Empty states</h2>
        <div id="empty-not-supplied">
          <EmptyState variant="not_supplied" />
        </div>
        <div id="empty-queued">
          <EmptyState variant="queued" />
        </div>
        <div id="empty-withheld">
          <EmptyState variant="withheld" />
        </div>
        <div id="empty-conflicting">
          <EmptyState variant="conflicting" />
        </div>
      </section>
    </div>
  );
}

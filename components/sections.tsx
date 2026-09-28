import Link from "next/link";
import { WorldMap } from "@/components/atlas/map/WorldMap";
import { Container, SectionHeading } from "@/components/container";
import { Logo } from "@/components/brand";
import type { CenterCoverageTotals, CenterFrontDoor, CenterSnapshot } from "@/lib/center/front-door";
import { footerLinks, github, org, unconfirmed } from "@/lib/content";
import { ATTRIBUTIONS } from "@/lib/atlas/boundaries/attribution";
import { atlasRoutes } from "@/lib/atlas/routes";
import { SEARCH_MODES, searchModeLabel } from "@/lib/atlas/search-params";

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy" aria-labelledby="center-hero-title">
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-navy/20" />
      <Container className="relative z-10 flex min-h-[78vh] flex-col justify-center py-20">
        <div className="max-w-2xl">
          <div className="mb-5 h-1 w-12 rounded-full bg-accent" />
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {org.name}
          </p>
          <h1
            id="center-hero-title"
            className="text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {org.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{org.lede}</p>
          <form action={atlasRoutes.search} method="get" className="mt-8 max-w-xl" role="search">
            <fieldset className="border-0 p-0">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Search mode
              </legend>
              <div className="flex flex-wrap gap-2">
                {SEARCH_MODES.map((mode) => (
                  <label
                    key={mode}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      defaultChecked={mode === "seat"}
                      className="accent-accent"
                    />
                    {searchModeLabel(mode)}
                  </label>
                ))}
              </div>
            </fieldset>
            <label htmlFor="center-search-q" className="mt-4 block text-sm font-medium text-white">
              Search
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="center-search-q"
                name="q"
                maxLength={200}
                placeholder="Name, place, or date"
                className="min-w-0 flex-1 rounded-full border border-white/20 bg-navy-800 px-4 py-3 text-sm text-white outline-none ring-accent/40 placeholder:text-white/40 focus:ring-2"
              />
              <button
                type="submit"
                className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-ink transition hover:bg-accent-soft"
              >
                Search the Atlas
              </button>
            </div>
          </form>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/atlas"
              className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:border-accent hover:text-accent"
            >
              Browse countries
            </Link>
            <Link
              href="/atlas/explorer"
              className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:border-accent hover:text-accent"
            >
              Explorer
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function WorldSection({ door }: { door: CenterFrontDoor }) {
  const note =
    door.status === "missing" || door.status === "unavailable"
      ? door.message
      : door.markers.length === 0
        ? "No loaded country has a coverage marker on this map."
        : "Marker size follows result rows on file. Colour follows coverage.";
  return (
    <section className="bg-white py-16" aria-labelledby="center-map-title">
      <Container>
        <SectionHeading eyebrow="Map" title="Coverage" />
        <p id="center-map-title" className="sr-only">
          World map
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-muted" data-center-map-note={door.status}>
          {note}
        </p>
        <WorldMap markers={door.markers} />
      </Container>
    </section>
  );
}

export function SnapshotStrip({ snapshots }: { snapshots: CenterSnapshot[] }) {
  return (
    <section className="bg-mist py-16" aria-label="Latest results ingested">
      <Container>
        <SectionHeading eyebrow="Ingested" title="Latest results ingested" />
        {snapshots.length === 0 ? (
          <p className="text-sm text-muted">No snapshot labels are loaded.</p>
        ) : (
          <ul className="grid gap-3">
            {snapshots.map((row) => (
              <li
                key={`${row.lineageId}:${row.releaseId}`}
                data-center-snapshot={row.snapshotLabel ?? ""}
                className="rounded-2xl border border-navy/10 bg-white px-4 py-3"
              >
                <p className="font-semibold text-navy">
                  {row.snapshotLabel ?? "Snapshot label not supplied"}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm">
          <Link href={atlasRoutes.releases} className="font-semibold text-navy hover:text-navy-600">
            Snapshot list
          </Link>
        </p>
      </Container>
    </section>
  );
}

const COVERAGE_FACTS: Array<{ key: keyof CenterCoverageTotals; label: string; attr: string }> = [
  { key: "countries", label: "Countries", attr: "data-center-countries" },
  { key: "offices", label: "Offices", attr: "data-center-offices" },
  { key: "officesWithResults", label: "Offices with results", attr: "data-center-offices-with-results" },
  { key: "events", label: "Elections", attr: "data-center-events" },
  { key: "eventsWithResults", label: "Elections with results", attr: "data-center-events-with-results" },
];

export function CoverageSection({ coverage }: { coverage: CenterCoverageTotals | null }) {
  return (
    <section className="bg-white py-16" aria-label="What the Atlas covers">
      <Container>
        <SectionHeading eyebrow="What is loaded" title="What the Atlas covers" />
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          These counts are country totals from the Atlas coverage tables. A place with no ingested
          records is not shown as zero coverage of a complete register.
        </p>
        {coverage ? (
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COVERAGE_FACTS.map((fact) => (
              <div
                key={fact.key}
                {...{ [fact.attr]: String(coverage[fact.key]) }}
                className="rounded-2xl border border-navy/8 bg-paper p-5 shadow-[var(--shadow-card)]"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">
                  {fact.label}
                </dt>
                <dd className="mt-2 text-3xl font-bold text-navy">{formatCount(coverage[fact.key])}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-8 text-sm text-muted" data-center-coverage="not-supplied">
            not supplied
          </p>
        )}
      </Container>
    </section>
  );
}

export function MethodologyBrief() {
  return (
    <section className="bg-mist py-16" aria-label="Methodology in brief">
      <Container>
        <SectionHeading eyebrow="How to read a record" title="Methodology in brief" />
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-muted">
          <p>
            A missing number is not a zero. A recorded zero stays zero. Dates keep the precision
            they were given: a month is not the first day of that month.
          </p>
          <p>
            Preliminary figures stay preliminary. A withheld value stays withheld. When two sources
            disagree and neither is adopted, the resolved value is not supplied.
          </p>
          <p>
            <Link href="/methodology" className="font-semibold text-navy hover:text-navy-600">
              Read the methodology
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

export function CiteBrief() {
  return (
    <section className="bg-white py-16" aria-label="Cite and download">
      <Container>
        <SectionHeading eyebrow="Use the records" title="Cite and download" />
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Cite the Center for Digital Democracy, the Election Atlas, the page address, and the
            snapshot label on the record. If that label is not supplied, say so. Do not invent a date.
          </p>
          <p>
            <Link href="/data" className="font-semibold text-navy hover:text-navy-600">
              Downloads and the search API
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

export function AboutBrief() {
  return (
    <section className="bg-navy py-16" aria-label="About the Center">
      <Container>
        <SectionHeading eyebrow="Publisher" title="About the Center" light />
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-white/75">
          <p>
            {org.name} publishes the Election Atlas on this website. Staff, funders, partners, and
            events are not listed until they are supplied.
          </p>
          <p>
            <Link href="/about" className="font-semibold text-accent hover:text-accent-soft">
              About the Center
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-800 text-white">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <h2 className="text-lg font-bold">{org.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Election Atlas. Public reading of ingested records.
          </p>
          <p className="mt-4 text-sm text-white/65">
            Email
            <br />
            <span data-center-contact-email="">{unconfirmed.contactEmail}</span>
          </p>
          <p className="mt-3">
            <a href={github.newIssue} className="text-sm font-semibold text-accent hover:text-accent-soft">
              Open a GitHub issue
            </a>
          </p>
        </div>
        <div>
          <h2 className="text-lg font-bold">Pages</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/75 hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold">Licence</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65" data-center-licence="">
            {unconfirmed.licence}
          </p>
          <h2 className="mt-6 text-lg font-bold">Attribution</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">{ATTRIBUTIONS.natural_earth}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            A public source address is not a licence to republish the file. Rights stay unknown
            unless a source states them.
          </p>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo href="/" />
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} {org.name}
          </p>
        </Container>
      </div>
    </footer>
  );
}

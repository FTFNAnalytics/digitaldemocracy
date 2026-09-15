import Link from "next/link";
import { Logo } from "@/components/brand";
import { Container } from "@/components/container";
import { ObservatoryNav } from "@/components/observatory/nav";
import { org } from "@/lib/content";
import { isFixtureOnlyDataset, getDataset } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";


export function ObservatoryBanner() {
  const fixture = isFixtureOnlyDataset();
  return (
    <div className="bg-navy-800 px-4 py-2 text-center text-xs text-white/80">
      <p>
        <span className="mr-2 inline-flex rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-ink">
          {fixture ? "Synthetic fixtures" : "Partial research"}
        </span>
        {fixture ? "Synthetic test data." : `Research snapshot ${getDataset().release.snapshotLabel}. Evidence gaps remain; see Coverage for requirements.`}
      </p>
    </div>
  );
}

export function ObservatoryHeader() {
  return (
    <header className="obs-chrome relative bg-navy/95 backdrop-blur-md">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Logo href="/" />
          <span className="hidden h-8 w-px bg-white/15 sm:block" aria-hidden />
          <Link
            href={obsRoutes.home}
            className="text-sm font-bold text-white hover:text-accent"
          >
            Election database
          </Link>
        </div>
        <Link href="/" className="obs-btn">
          Back to the Center
        </Link>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-2">
          <ObservatoryNav />
        </Container>
      </div>
    </header>
  );
}

export function ObservatoryFooter() {
  return (
    <footer className="obs-chrome mt-16 bg-navy-800 text-white">
      <Container className="flex flex-col gap-3 py-8 text-sm text-white/70 sm:flex-row sm:justify-between">
        <p>
          {org.name} · Subnational Election Observatory. Public reading of research
          records; no login required.
        </p>
        <p>
          <Link href={obsRoutes.methodology} className="font-semibold text-accent hover:text-accent-soft">
            Methodology
          </Link>
          {" · "}
          <Link href={obsRoutes.about} className="font-semibold text-accent hover:text-accent-soft">
            About
          </Link>
        </p>
      </Container>
    </footer>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-navy/10 pb-6">
      <div className="mb-4 h-1 w-12 rounded-full bg-accent" />
      {eyebrow ? <p className="obs-kicker">{eyebrow}</p> : null}
      <h1 className="obs-heading text-3xl tracking-tight sm:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-3xl text-[1.02rem] leading-relaxed text-muted">{description}</p>
      ) : null}
      {children}
    </header>
  );
}

export function CiteBlock({
  title,
  path,
  extra,
}: {
  title: string;
  path: string;
  extra?: string;
}) {
  const fixture = isFixtureOnlyDataset();
  return (
    <section className="obs-card mt-10 p-5 print:break-inside-avoid">
      <h2 className="obs-heading text-xl">Cite this record</h2>
      <p className="mt-2 text-sm leading-relaxed text-navy/80">
        {org.name}. “{title}.” <em>Subnational Election Observatory</em>, release
        {getDataset().release.id}, snapshot {getDataset().release.snapshotLabel}. {path}.
        {extra ? ` ${extra}` : ""}
      </p>
      {fixture ? (
        <p className="mt-2 text-sm text-muted">
          Synthetic fixture — not a citable research record. Await the Latin America
          release package before quoting figures.
        </p>
      ) : null}
    </section>
  );
}

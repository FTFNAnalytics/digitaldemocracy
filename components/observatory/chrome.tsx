import Link from "next/link";
import { org } from "@/lib/content";
import { isFixtureOnlyDataset } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { RELEASE_PACKAGE_FILENAME } from "@/schemas/v1/input-manifest";
import { ObservatoryNav } from "@/components/observatory/nav";

export function ObservatoryBanner() {
  const fixture = isFixtureOnlyDataset();
  return (
    <div className="border-b border-obs-rule bg-[#fff7d6] px-4 py-2.5 text-center text-sm text-navy">
      <p>
        <span className="mr-2 inline-flex rounded-sm bg-navy px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
          {fixture ? "Synthetic fixtures" : "Partial import"}
        </span>
        Research is awaiting <span className="font-semibold">{RELEASE_PACKAGE_FILENAME}</span>.
        Nothing on these pages is completed Latin America coverage.
      </p>
    </div>
  );
}

export function ObservatoryHeader() {
  return (
    <header className="obs-chrome border-b border-obs-rule bg-obs-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-3 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href={obsRoutes.home} className="group leading-tight">
              <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-obs-teal">
                {org.name}
              </span>
              <span className="block font-serif text-lg font-semibold text-navy group-hover:text-obs-teal">
                Subnational Election Observatory
              </span>
            </Link>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-obs-teal underline-offset-4 hover:underline"
          >
            Back to the Center
          </Link>
        </div>
        <ObservatoryNav />
      </div>
    </header>
  );
}

export function ObservatoryFooter() {
  return (
    <footer className="obs-chrome mt-16 border-t border-obs-rule bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-navy/70 sm:px-8 sm:flex-row sm:justify-between">
        <p>
          {org.name} · Subnational Election Observatory. Public reading of research
          records; no login required.
        </p>
        <p>
          <Link href={obsRoutes.methodology} className="text-obs-teal hover:underline">
            Methodology
          </Link>
          {" · "}
          <Link href={obsRoutes.about} className="text-obs-teal hover:underline">
            About
          </Link>
        </p>
      </div>
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
    <header className="mb-8 border-b border-obs-rule pb-6">
      {eyebrow ? (
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-obs-teal">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-3xl text-[1.02rem] leading-relaxed text-navy/75">{description}</p>
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
    <section className="mt-10 rounded-sm border border-obs-rule bg-white p-5 print:break-inside-avoid">
      <h2 className="font-serif text-xl text-navy">Cite this record</h2>
      <p className="mt-2 text-sm leading-relaxed text-navy/80">
        {org.name}. “{title}.” <em>Subnational Election Observatory</em>, release
        synthetic-fixture-v0 (not a research snapshot). {path}.
        {extra ? ` ${extra}` : ""}
      </p>
      {fixture ? (
        <p className="mt-2 text-sm text-navy/60">
          Synthetic fixture — not a citable research record. Await the Latin America
          release package before quoting figures.
        </p>
      ) : null}
    </section>
  );
}

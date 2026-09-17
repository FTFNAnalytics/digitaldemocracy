import Link from "next/link";
import { Logo } from "@/components/brand";
import { Container } from "@/components/container";
import { org } from "@/lib/content";
import { atlasRoutes } from "@/lib/atlas/routes";

export function AtlasBanner() {
  return (
    <div className="bg-navy-800 px-4 py-2 text-center text-xs text-white/80">
      <p>
        <span className="mr-2 inline-flex rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-ink">
          Atlas MVP
        </span>
        Europe-first Election Atlas reading the SQLite master. Loaded countries are listed as imported; Latin America is not the launch vertical.
      </p>
    </div>
  );
}

export function AtlasHeader() {
  return (
    <header className="obs-chrome relative bg-navy/95 backdrop-blur-md">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Logo href="/" />
          <span className="hidden h-8 w-px bg-white/15 sm:block" aria-hidden />
          <Link href={atlasRoutes.home} className="text-sm font-bold text-white hover:text-accent">
            Election Atlas
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={atlasRoutes.explorer}
            className="text-sm font-semibold text-white/80 hover:text-accent"
          >
            Explorer
          </Link>
          <Link
            href="/electiondatabase"
            className="text-sm font-semibold text-white/80 hover:text-accent"
          >
            Observatory
          </Link>
          <Link href="/" className="obs-btn">
            Back to the Center
          </Link>
        </div>
      </Container>
    </header>
  );
}

export function AtlasFooter() {
  return (
    <footer className="obs-chrome mt-16 bg-navy-800 text-white">
      <Container className="flex flex-col gap-3 py-8 text-sm text-white/70 sm:flex-row sm:justify-between">
        <p>
          {org.name} · Election Atlas MVP. Public reading of imported SQLite
          records; no login required.
        </p>
        <p>
          <Link href={atlasRoutes.explorer} className="font-semibold text-accent hover:text-accent-soft">
            Explorer
          </Link>
          {" · "}
          <Link href="/electiondatabase" className="font-semibold text-accent hover:text-accent-soft">
            Subnational Election Observatory
          </Link>
          {" · "}
          <Link href="/" className="font-semibold text-accent hover:text-accent-soft">
            Center home
          </Link>
        </p>
      </Container>
    </footer>
  );
}

export function AtlasPageHeader({
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

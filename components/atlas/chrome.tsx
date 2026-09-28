import Link from "next/link";
import { Logo } from "@/components/brand";
import { Container } from "@/components/container";
import { org } from "@/lib/content";
import { SearchPalette } from "@/components/atlas/search-palette";
import { atlasRoutes } from "@/lib/atlas/routes";

export function AtlasBanner() {
  return (
    <div className="border-b border-atlas-line bg-atlas-tint px-4 py-2 text-center text-xs text-atlas-ink">
      <p>Europe-first Election Atlas. This site lists the countries that are loaded.</p>
    </div>
  );
}

export function AtlasHeader() {
  return (
    <header className="obs-chrome border-b border-atlas-line bg-atlas-card/95 backdrop-blur-md">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-full bg-navy px-3 py-1">
            <Logo href="/" />
          </div>
          <span className="hidden h-8 w-px bg-atlas-line sm:block" aria-hidden />
          <Link href={atlasRoutes.home} className="text-sm font-bold text-atlas-ink hover:text-atlas-accent">
            Election Atlas
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={atlasRoutes.explorer} className="text-sm font-semibold text-atlas-accent hover:underline">
            Explorer
          </Link>
          <SearchPalette />
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
    <footer className="obs-chrome mt-16 border-t border-atlas-line bg-atlas-card text-atlas-ink-2">
      <Container className="flex flex-col gap-3 py-8 text-sm sm:flex-row sm:justify-between">
        <p>{org.name} · Election Atlas. Public reading; no login required.</p>
        <p>
          <Link href={atlasRoutes.explorer} className="font-semibold text-atlas-accent hover:underline">
            Explorer
          </Link>
          {" · "}
          <Link href={atlasRoutes.search} className="font-semibold text-atlas-accent hover:underline">
            Search
          </Link>
          {" · "}
          <Link href={atlasRoutes.releases} className="font-semibold text-atlas-accent hover:underline">
            Releases
          </Link>
          {" · "}
          <Link href="/" className="font-semibold text-atlas-accent hover:underline">
            Center home
          </Link>
        </p>
      </Container>
    </footer>
  );
}

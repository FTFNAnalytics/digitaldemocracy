import type { Metadata } from "next";
import Link from "next/link";
import { atlasRoutes } from "@/lib/atlas/routes";
import { missingRecordMeta } from "@/lib/seo";

export const metadata: Metadata = missingRecordMeta;

export default function AtlasNotFound() {
  return (
    <div className="py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-atlas-ink-2">404</p>
      <h1 className="mt-3 font-atlas-heading text-3xl text-atlas-ink">Atlas record not found</h1>
      <p className="mt-3 max-w-xl text-atlas-ink-2">That country, office, or election is not loaded.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={atlasRoutes.home} className="obs-btn">
          Atlas home
        </Link>
        <Link href={atlasRoutes.explorer} className="obs-btn-secondary">
          Explorer
        </Link>
      </div>
    </div>
  );
}

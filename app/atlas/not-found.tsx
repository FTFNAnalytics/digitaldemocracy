import type { Metadata } from "next";
import Link from "next/link";
import { atlasRoutes } from "@/lib/atlas/routes";
import { missingRecordMeta } from "@/lib/seo";

export const metadata: Metadata = missingRecordMeta;

export default function AtlasNotFound() {
  return (
    <div className="py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-600">404</p>
      <h1 className="mt-3 obs-heading text-3xl">Atlas record not found</h1>
      <p className="mt-3 max-w-xl text-navy/70">
        That country or office is not in the loaded Atlas SQLite file. Residual-heavy draft packs
        are not imported.
      </p>
      <Link href={atlasRoutes.home} className="obs-btn mt-6">
        Atlas home
      </Link>
    </div>
  );
}

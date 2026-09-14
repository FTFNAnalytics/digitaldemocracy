import Link from "next/link";
import { org } from "@/lib/content";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-navy px-6 text-center text-white">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">404</p>
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 max-w-md text-white/70">
          That URL is not part of the {org.name} prototype. Return home to the live
          single-page site.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-ink"
        >
          Back to the Center
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import { obsRoutes } from "@/lib/observatory/routes";

export default function ObservatoryNotFound() {
  return (
    <div className="py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-obs-teal">404</p>
      <h1 className="mt-3 font-serif text-3xl text-navy">Record not found</h1>
      <p className="mt-3 max-w-xl text-navy/70">
        That observatory path is not in the loaded dataset. The Latin America release has not
        been imported, so only synthetic fixture identifiers resolve.
      </p>
      <Link
        href={obsRoutes.home}
        className="mt-6 inline-flex rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-white"
      >
        Observatory home
      </Link>
    </div>
  );
}

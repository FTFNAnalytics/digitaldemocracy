import Link from "next/link";
import { obsRoutes } from "@/lib/observatory/routes";

export default function ObservatoryNotFound() {
  return (
    <div className="py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-600">
        404
      </p>
      <h1 className="mt-3 obs-heading text-3xl">Record not found</h1>
      <p className="mt-3 max-w-xl text-navy/70">
        That observatory path is not in the loaded dataset. Check the identifier
        or use the explorer to find an imported record.
      </p>
      <Link href={obsRoutes.home} className="obs-btn mt-6">
        Observatory home
      </Link>
    </div>
  );
}

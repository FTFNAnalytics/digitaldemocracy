import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { SeatPageView } from "@/components/atlas/seat-page";
import { loadAtlasCatalog } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";
import { readSeatPage, resolveSeatAlias } from "@/lib/atlas/seat/read";

type Props = {
  params: Promise<{ path?: string[] }>;
};

function splitAlias(path: string[] | undefined): { jurisdictionSlugPath: string; officeSlug: string } | null {
  if (!path || path.length < 2) return null;
  const officeSlug = path[path.length - 1];
  const jurisdictionSlugPath = path.slice(0, -1).join("/");
  if (!officeSlug || !jurisdictionSlugPath) return null;
  return { jurisdictionSlugPath, officeSlug: decodeURIComponent(officeSlug) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const split = splitAlias(path);
  if (!split) return { title: "Atlas office not found", robots: { index: false, follow: true } };
  const resolved = resolveSeatAlias(split.jurisdictionSlugPath, split.officeSlug);
  if (resolved.status !== "canonical") {
    return { title: "Atlas office not found", robots: { index: false, follow: true } };
  }
  const model = readSeatPage(resolved.idNamespace, resolved.officeId);
  if (!model) return { title: "Atlas office not found", robots: { index: false, follow: true } };
  return {
    title: `${model.officeName} · Election Atlas`,
    description: `Elections and results on file for ${model.officeName}.`,
    alternates: { canonical: atlasRoutes.office(model.officeId) },
  };
}

export default async function AtlasSeatAliasPage({ params }: Props) {
  const { path } = await params;
  const split = splitAlias(path);
  if (!split) notFound();

  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }

  const resolved = resolveSeatAlias(split.jurisdictionSlugPath, split.officeSlug);
  if (resolved.status === "missing") notFound();
  if (resolved.status === "redirect") permanentRedirect(resolved.href);

  const model = readSeatPage(resolved.idNamespace, resolved.officeId);
  if (!model) notFound();
  return <SeatPageView model={model} />;
}

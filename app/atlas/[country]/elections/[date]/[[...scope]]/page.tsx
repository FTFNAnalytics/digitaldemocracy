import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CyclePageView } from "@/components/atlas/cycle-page";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { loadCyclePage } from "@/lib/atlas/cycle/read";
import { readAtlasDerived } from "@/lib/atlas/publication";

export const revalidate = false;

type Props = {
  params: Promise<{ country: string; date: string; scope?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

async function load(country: string, date: string, scope: string[] | undefined) {
  return readAtlasDerived(`cycle:${country}:${date}:${(scope ?? []).join("/")}`, () =>
    loadCyclePage({ country, dateToken: date, scope }),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, date, scope } = await params;
  const loaded = await load(country, date, scope);
  if (loaded.status === "unavailable" || loaded.status === "not_found") {
    return { title: "Atlas election not found", robots: { index: false, follow: true } };
  }
  if (loaded.status === "alias") {
    return { alternates: { canonical: loaded.path }, robots: { index: false, follow: true } };
  }
  const title = `${loaded.model.label} · Election Atlas`;
  return {
    title: { absolute: title },
    description: loaded.model.description,
    alternates: { canonical: loaded.model.path },
    openGraph: { title, description: loaded.model.description, url: loaded.model.path },
  };
}

export default async function AtlasCyclePage({ params, searchParams }: Props) {
  const { country, date, scope } = await params;
  const query = await searchParams;
  const loaded = await load(country, date, scope);
  if (loaded.status === "unavailable") {
    return <DatabaseUnavailable message={loaded.message} sqlitePath={loaded.sqlitePath} />;
  }
  if (loaded.status === "not_found") notFound();
  if (loaded.status === "alias") permanentRedirect(loaded.path);
  return <CyclePageView model={loaded.model} contest={one(query.contest)} q={one(query.q).slice(0, 200)} />;
}

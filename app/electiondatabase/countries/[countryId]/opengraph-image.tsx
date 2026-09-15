import { brandedOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-image";
import { getCountry } from "@/lib/observatory/load";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Country research — Subnational Election Observatory";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Props = { params: Promise<{ countryId: string }> };

export default async function Image({ params }: Props) {
  const { countryId } = await params;
  const country = getCountry(countryId);
  const title = country?.names.official ?? "Country research";
  const coverage = country
    ? country.coverageStatus.replaceAll("_", " ")
    : "not in the loaded dataset";

  return brandedOgImage({
    badge: country?.kind === "territory" ? "TERRITORY" : "COUNTRY",
    title,
    subtitle: `Subnational election research · ${coverage} coverage`,
  });
}

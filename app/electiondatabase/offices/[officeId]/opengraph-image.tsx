import { brandedOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-image";
import { getCountry, getOffice } from "@/lib/observatory/load";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Office briefing — Subnational Election Observatory";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Props = { params: Promise<{ officeId: string }> };

export default async function Image({ params }: Props) {
  const { officeId } = await params;
  const office = getOffice(officeId);
  const country = office ? getCountry(office.countryId) : undefined;
  const title = office?.names.official ?? "Office briefing";
  const place = country?.names.official ?? office?.countryId ?? "Observatory";

  return brandedOgImage({
    badge: "OFFICE",
    title,
    subtitle: office
      ? `${place} · ${office.tier} ${office.officeType}`
      : "Subnational Election Observatory",
  });
}

import { brandedOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-image";
import { getCountry, getOffice } from "@/lib/observatory/load";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Original briefing — Subnational Election Observatory";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Props = { params: Promise<{ officeId: string }> };

export default async function Image({ params }: Props) {
  const { officeId } = await params;
  const office = getOffice(officeId);
  const country = office ? getCountry(office.countryId) : undefined;
  const title = office?.names.official ?? "Original briefing";
  const place = country?.names.official ?? office?.countryId ?? "Observatory";

  return brandedOgImage({
    badge: "ORIGINAL BRIEFING",
    title,
    subtitle: `Source publication · ${place}`,
  });
}

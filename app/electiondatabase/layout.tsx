export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import {
  ObservatoryBanner,
  ObservatoryFooter,
  ObservatoryHeader,
} from "@/components/observatory/chrome";
import { observatoryDatasetJsonLd } from "@/lib/json-ld";
import { getDataset } from "@/lib/observatory/load";
import { OBSERVATORY_NAME, robotsAllow } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: OBSERVATORY_NAME,
    template: `%s · ${OBSERVATORY_NAME}`,
  },
  description:
    "Searchable subnational election research from the Center for Digital Democracy. Explore imported Latin America records, original evidence, and remaining research gaps.",
  robots: robotsAllow,
  twitter: {
    card: "summary_large_image",
  },
};

export default function ObservatoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const release = getDataset().release;
  return (
    <div className="observatory min-h-screen bg-mist text-ink">
      <JsonLd data={observatoryDatasetJsonLd(release)} />
      <a
        href="#observatory-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-accent-ink"
      >
        Skip to observatory content
      </a>
      <div className="sticky top-0 z-50">
        <ObservatoryBanner />
        <ObservatoryHeader />
      </div>
      <main id="observatory-content">
        <Container className="py-10">{children}</Container>
      </main>
      <ObservatoryFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/container";
import {
  ObservatoryBanner,
  ObservatoryFooter,
  ObservatoryHeader,
} from "@/components/observatory/chrome";

export const metadata: Metadata = {
  title: {
    default: "Subnational Election Observatory",
    template: "%s · Subnational Election Observatory",
  },
  description:
    "Searchable subnational election research from the Center for Digital Democracy. Latin America import is awaiting the release package.",
};

export default function ObservatoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="observatory min-h-screen bg-mist text-ink">
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

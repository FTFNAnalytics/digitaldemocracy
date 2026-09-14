import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import {
  ObservatoryBanner,
  ObservatoryFooter,
  ObservatoryHeader,
} from "@/components/observatory/chrome";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

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
    <div className={`${sourceSerif.variable} observatory min-h-screen bg-obs-paper text-navy`}>
      <a
        href="#observatory-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-navy focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to observatory content
      </a>
      <ObservatoryBanner />
      <ObservatoryHeader />
      <main id="observatory-content" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        {children}
      </main>
      <ObservatoryFooter />
    </div>
  );
}

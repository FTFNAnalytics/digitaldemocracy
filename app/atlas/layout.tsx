export const runtime = "nodejs";

import type { Metadata } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import { Container } from "@/components/container";
import { AtlasBanner, AtlasFooter, AtlasHeader } from "@/components/atlas/chrome";
import { pageMeta, staticPageSeo } from "@/lib/seo";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = pageMeta(staticPageSeo.atlas);

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`atlas ${newsreader.variable} ${publicSans.variable} min-h-screen bg-atlas-paper font-atlas-body text-atlas-ink`}>
      <a
        href="#atlas-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-atlas-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-atlas-on-accent"
      >
        Skip to Atlas content
      </a>
      <div className="sticky top-0 z-50">
        <AtlasBanner />
        <AtlasHeader />
      </div>
      <main id="atlas-content">
        <Container className="py-10">{children}</Container>
      </main>
      <AtlasFooter />
    </div>
  );
}

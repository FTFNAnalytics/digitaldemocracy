import type { Metadata } from "next";
import {
  AboutBrief,
  CiteBrief,
  CoverageSection,
  Hero,
  MethodologyBrief,
  SnapshotStrip,
  WorldSection,
} from "@/components/sections";
import { loadCenterFrontDoor } from "@/lib/center/front-door";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta(staticPageSeo.home);

export default function Home() {
  const door = loadCenterFrontDoor();
  return (
    <>
      <Hero />
      <WorldSection door={door} />
      <SnapshotStrip snapshots={door.snapshots} />
      <CoverageSection coverage={door.coverage} />
      <MethodologyBrief />
      <CiteBrief />
      <AboutBrief />
    </>
  );
}

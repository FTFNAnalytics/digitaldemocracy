import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingKit } from "@/components/atlas/reading-kit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Atlas reading kit",
  robots: { index: false, follow: false },
};

export default function ReadingKitPage() {
  if (process.env.ATLAS_KIT !== "1") notFound();
  return <ReadingKit />;
}

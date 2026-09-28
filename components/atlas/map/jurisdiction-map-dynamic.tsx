"use client";

import dynamic from "next/dynamic";
import type { MapLayerId, MapPlace } from "@/lib/atlas/map/model";

const JurisdictionMap = dynamic(() => import("./JurisdictionMap").then((mod) => mod.JurisdictionMap), {
  ssr: false,
  loading: () => (
    <div
      data-atlas-map-loading="true"
      className="relative min-h-72 rounded-2xl border border-atlas-line bg-atlas-map p-4 text-sm text-atlas-ink"
    >
      <p>Loading boundary shapes</p>
      <div id="atlas-map-mount" data-atlas-map-mount="" />
    </div>
  ),
});

export function DynamicJurisdictionMap(props: {
  parentLevel: string;
  topojsonUrl: string;
  attribution: string | null;
  asOfYear: number;
  places: MapPlace[];
  initialLayer?: MapLayerId;
}) {
  return <JurisdictionMap {...props} />;
}

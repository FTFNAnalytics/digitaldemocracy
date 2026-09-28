import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: { href: string; children?: ReactNode }) =>
      React.createElement("a", { href, ...props }, children),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => undefined }),
}));

import { ATTRIBUTIONS } from "../../lib/atlas/boundaries/attribution";
import { childrenTopojson, indexFeatures } from "../../lib/atlas/boundaries/geometry";
import type { CrosswalkRow } from "../../lib/atlas/boundaries/types";
import { earliestNextDate, latestTurnout, suppliedMargin, type SeatMetricRow, type TurnoutEventRow } from "../../lib/atlas/map/child-facts";
import { projectChildren, squaresTopology } from "../../lib/atlas/map/geometry";
import { ATLAS_GEO_CACHE_CONTROL } from "../../lib/atlas/map/headers";
import {
  boundaryAttribution,
  chooseMapRenderer,
  COVERAGE_LEGEND,
  COVERAGE_STEP_MIX,
  coverageMixGaps,
  coveragePaint,
  geometryUrl,
  keyboardOpensShape,
  layerControls,
  tooltipFields,
  topojsonUrlForParent,
  webglAvailable,
  type MapPlace,
} from "../../lib/atlas/map/model";
import { attributionForCountry, publishedChildrenTopojsonUrl } from "../../lib/atlas/map/publish";
import { buildWorldMarkers, worldMarkerRadius } from "../../lib/atlas/map/world";
import { JurisdictionMap } from "../../components/atlas/map/JurisdictionMap";
import { WorldMap } from "../../components/atlas/map/WorldMap";
import { JurisdictionTemplate } from "../../components/atlas/jurisdiction-template";
import type { AtlasCoverageSnapshot } from "../../components/atlas/types";

const repoRoot = path.join(import.meta.dirname, "../..");

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node as ReturnType<typeof createElement>);
}

const recorded: AtlasCoverageSnapshot = {
  offices: 4,
  officesWithAnyEvent: 4,
  officesWithResults: 4,
  eventsTotal: 4,
  eventsWithResults: 4,
  notSuppliedNextDates: 0,
  latestSnapshotLabel: "fixture",
};

function place(partial: Partial<MapPlace> & Pick<MapPlace, "id" | "name">): MapPlace {
  return {
    href: `/atlas/fixture/${partial.id}`,
    level: "Municipality",
    levelKey: "municipality",
    seatsTracked: 2,
    firstEventYear: 2015,
    lastEventYear: 2023,
    coverage: recorded,
    nextDateId: null,
    nextYear: null,
    turnout: null,
    margin: null,
    marginUnit: null,
    ...partial,
  };
}

describe("map model", () => {
  it("turns a colon parent key into the OV-07 TopoJSON URL and keeps PMTiles off jurisdiction views", () => {
    expect(topojsonUrlForParent("country:albania")).toBe("/atlas/geo/country_albania.json");
    expect(geometryUrl({ scope: "jurisdiction", parentKey: "country:albania" })).toBe("/atlas/geo/country_albania.json");
    expect(geometryUrl({ scope: "europe" })).toBe("/atlas/geo/europe-lau.pmtiles");
    expect(geometryUrl({ scope: "jurisdiction", parentKey: "country:albania" })).not.toContain("pmtiles");
  });

  it("keeps coverage steps at least 12 points apart and hatches places that are not ingested", () => {
    expect(coverageMixGaps(COVERAGE_STEP_MIX, 12)).toBe(true);
    expect(COVERAGE_LEGEND.map((step) => step.mix)).toEqual([...COVERAGE_STEP_MIX]);
    const css = readFileSync(path.join(repoRoot, "app/globals.css"), "utf8");
    for (const mix of COVERAGE_STEP_MIX) {
      expect(css).toContain(`var(--atlas-accent) ${mix}%`);
    }
    expect(coveragePaint(null)).toBe("not_ingested");
    expect(coveragePaint({ ...recorded, officesWithResults: 0, eventsWithResults: 0 })).toBe("not_ingested");
    expect(coveragePaint({ ...recorded, offices: 4, officesWithResults: 1 })).toBe(1);
    expect(coveragePaint({ ...recorded, offices: 4, officesWithResults: 2 })).toBe(2);
    expect(coveragePaint({ ...recorded, offices: 4, officesWithResults: 3 })).toBe(3);
    expect(coveragePaint(recorded)).toBe(4);
  });

  it("uses inline SVG for a small municipal ward map and MapLibre otherwise", () => {
    expect(
      chooseMapRenderer({ parentLevel: "municipality", childLevels: ["ward"], approvedShapeCount: 12 }),
    ).toBe("svg");
    expect(
      chooseMapRenderer({ parentLevel: "municipality", childLevels: ["area"], approvedShapeCount: 99 }),
    ).toBe("svg");
    expect(
      chooseMapRenderer({ parentLevel: "municipality", childLevels: ["ward"], approvedShapeCount: 100 }),
    ).toBe("maplibre");
    expect(
      chooseMapRenderer({ parentLevel: "country", childLevels: ["municipality"], approvedShapeCount: 61 }),
    ).toBe("maplibre");
    expect(
      chooseMapRenderer({ parentLevel: "municipality", childLevels: ["municipality"], approvedShapeCount: 4 }),
    ).toBe("maplibre");
    expect(chooseMapRenderer({ parentLevel: "country", childLevels: [], approvedShapeCount: 0 })).toBe("empty");
    expect(chooseMapRenderer({ parentLevel: "country", childLevels: ["municipality"], approvedShapeCount: 61, scope: "europe" })).toBe(
      "pmtiles",
    );
  });

  it("disables turnout and margin when the source did not supply them", () => {
    const places = [place({ id: "a", name: "Alpha" }), place({ id: "b", name: "Beta" })];
    const controls = layerControls(places);
    expect(controls.find((control) => control.id === "turnout")).toMatchObject({ enabled: false, note: "not supplied" });
    expect(controls.find((control) => control.id === "margin")).toMatchObject({ enabled: false, note: "not supplied" });
    expect(controls.find((control) => control.id === "navigate")?.enabled).toBe(true);
    const supplied = layerControls([
      place({ id: "a", name: "Alpha", turnout: 62, margin: 4, marginUnit: "percent_0_100" }),
    ]);
    expect(supplied.find((control) => control.id === "turnout")?.enabled).toBe(true);
    expect(supplied.find((control) => control.id === "margin")?.enabled).toBe(true);
  });

  it("does not average two margins and keeps the earliest next date", () => {
    const seats: SeatMetricRow[] = [
      {
        jurisdictionKey: "a",
        executive: true,
        nextDateId: "date-late",
        year: 2027,
        month: 5,
        day: 1,
        margin: 8,
        marginUnit: "percent_0_100",
      },
      {
        jurisdictionKey: "a",
        executive: true,
        nextDateId: "date-early",
        year: 2026,
        month: 6,
        day: 1,
        margin: 3,
        marginUnit: "percent_0_100",
      },
    ];
    expect(suppliedMargin(seats)).toEqual({ margin: null, marginUnit: null });
    expect(earliestNextDate(seats)).toEqual({ nextDateId: "date-early", nextYear: 2026 });
    expect(suppliedMargin([seats[0]!])).toEqual({ margin: 8, marginUnit: "percent_0_100" });
    const events: TurnoutEventRow[] = [
      { jurisdictionKey: "a", eventId: "old", year: 2019, month: 5, day: 1, turnout: 40 },
      { jurisdictionKey: "a", eventId: "new", year: 2023, month: 5, day: 14, turnout: 55 },
    ];
    expect(latestTurnout(events)).toBe(55);
    expect(latestTurnout([])).toBeNull();
  });

  it("reads attribution only from an approved crosswalk", () => {
    expect(boundaryAttribution("gisco_lau")).toBe(ATTRIBUTIONS.gisco_lau);
    expect(attributionForCountry("albania", repoRoot)).toBe(ATTRIBUTIONS.gisco_lau);
    expect(attributionForCountry("not-a-country", repoRoot)).toBeNull();
    expect(webglAvailable()).toBe(false);
    expect(keyboardOpensShape("Enter")).toBe(true);
    expect(keyboardOpensShape(" ")).toBe(false);
  });

  it("serves TopoJSON and PMTiles with an immutable cache header", () => {
    const nextConfig = readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");
    expect(nextConfig).toContain("atlasGeoCacheHeaders");
    expect(ATLAS_GEO_CACHE_CONTROL).toBe("public, max-age=31536000, immutable");
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-geo-"));
    expect(publishedChildrenTopojsonUrl("country:albania", dir)).toBeNull();
    mkdirSync(path.join(dir, "atlas", "geo"), { recursive: true });
    writeFileSync(path.join(dir, "atlas", "geo", "country_albania.json"), "{}\n");
    expect(publishedChildrenTopojsonUrl("country:albania", dir)).toBe("/atlas/geo/country_albania.json");
  });
});

describe("jurisdiction map rendering", () => {
  const albania = JSON.parse(readFileSync(path.join(repoRoot, "schemas/atlas/boundaries/albania.json"), "utf8")) as {
    rows: Array<{ jurisdiction_key: string; name: string; level: string; parent_key: string; review_status: string }>;
  };

  function albaniaPlaces(): MapPlace[] {
    return albania.rows
      .filter((row) => row.review_status === "approved" && row.parent_key === "country:albania" && row.level === "municipality")
      .map((row) =>
        place({
          id: row.jurisdiction_key,
          name: row.name,
          href: `/atlas/albania/${row.jurisdiction_key}`,
          level: "Municipality",
          levelKey: "municipality",
        }),
      );
  }

  it("renders the Albania fixture as 61 municipal shapes with tooltip fields, links, and keyboard targets", () => {
    const places = albaniaPlaces();
    expect(places).toHaveLength(61);
    const topology = squaresTopology(
      places.map((item) => ({ jurisdictionKey: item.id, name: item.name, level: "municipality" })),
    );
    expect(projectChildren(topology).shapes).toHaveLength(61);
    const html = markup(
      createElement(JurisdictionMap, {
        parentLevel: "country",
        topology,
        attribution: ATTRIBUTIONS.gisco_lau,
        asOfYear: 2026,
        places,
      }),
    );
    expect(html.match(/data-atlas-shape=/g)).toHaveLength(61);
    expect(html.match(/data-atlas-fill=/g)).toHaveLength(61);
    expect(html).toContain('data-atlas-parent-outline="true"');
    expect(html).toContain('data-atlas-renderer="maplibre"');
    expect(html).toContain('data-atlas-webgl="off"');
    expect(html).not.toContain("maplibregl");
    expect(html).toContain("Seats tracked");
    expect(html).toContain("Results span");
    expect(html).toContain("2015–2023");
    expect(html).toContain("Coverage");
    expect(html).toContain('data-atlas-tooltip-field="name"');
    expect(html).toContain('data-atlas-tooltip-field="level"');
    expect(html).toContain('data-atlas-keyboard="tab-enter"');
    expect(html).toContain(`href="/atlas/albania/${places[0]!.id}"`);
    expect(html).not.toContain('tabindex="-1"');
    expect(html).toContain(ATTRIBUTIONS.gisco_lau);
    expect(html).toContain('data-atlas-layer="turnout"');
    expect(html).toContain("not supplied");
    const turnout = html.slice(html.indexOf('data-atlas-layer="turnout"') - 80, html.indexOf('data-atlas-layer="turnout"') + 220);
    expect(turnout).toContain("disabled");
    expect(html.match(/data-atlas-legend=/g)).toHaveLength(1);
  });

  it("draws a ward map as inline SVG and leaves the list twin usable without WebGL", () => {
    const places = [
      place({ id: "ward-a", name: "North ward", level: "Ward", levelKey: "ward", href: "/atlas/fixture/north" }),
      place({ id: "ward-b", name: "South ward", level: "Ward", levelKey: "ward", href: "/atlas/fixture/south", seatsTracked: null, firstEventYear: null, lastEventYear: null, coverage: null }),
    ];
    const topology = squaresTopology(
      places.map((item) => ({ jurisdictionKey: item.id, name: item.name, level: "ward" })),
    );
    const map = createElement(JurisdictionMap, {
      parentLevel: "municipality",
      topology,
      attribution: null,
      asOfYear: 2026,
      places,
      initialLayer: "coverage",
    });
    const html = markup(
      createElement(JurisdictionTemplate, {
        breadcrumb: [{ label: "World" }],
        name: "Fixture municipality",
        places: places.map((item) => ({
          id: item.id,
          name: item.name,
          href: item.href,
          level: item.level,
          kind: item.levelKey,
          coverage: item.coverage,
        })),
        seats: [],
        cycles: [],
        map,
      }),
    );
    expect(html).toContain('data-atlas-renderer="svg"');
    expect(html).toContain('data-atlas-webgl="off"');
    expect(html).toContain('data-atlas-list-twin="companion"');
    expect(html).toContain('aria-label="Places"');
    expect(html).toContain("Show map");
    expect(html).toContain("hidden md:block");
    expect(html).toContain("North ward");
    expect(html).toContain('data-atlas-legend="coverage"');
    expect(html).toContain("Not ingested");
    expect(html).toContain("not supplied");
    expect(html).not.toContain("maplibregl");
    const fields = tooltipFields(places[1]!);
    expect(fields.map((field) => field.value)).toContain("not supplied");
  });

  it("keeps the list twin full width when no approved shapes are published", () => {
    const html = markup(
      createElement(JurisdictionTemplate, {
        breadcrumb: [{ label: "World" }],
        name: "Fixture country",
        places: [
          {
            id: "place-1",
            name: "Fixture place",
            href: "/atlas",
            level: "Municipality",
            kind: "municipality",
            coverage: recorded,
          },
        ],
        seats: [],
        cycles: [],
      }),
    );
    expect(html).toContain("Map pending boundary review");
    expect(html).toContain('data-atlas-map-state="pending"');
    expect(html).toContain('data-atlas-list-twin="full"');
    expect(html).toContain('aria-label="Places"');
    expect(html).not.toContain("Show map");
    expect(html).not.toContain("data-atlas-fill");
    expect(html).toContain('data-atlas-map-mount');
  });

  it("projects an OV-07 TopoJSON fixture onto one path per approved child", async () => {
    const geometry = JSON.parse(readFileSync(path.join(repoRoot, "tests/fixtures/boundaries/two-children.geojson"), "utf8"));
    const row = (code: string, key: string, name: string): CrosswalkRow => ({
      jurisdiction_key: key,
      boundary_code: code,
      name,
      level: "municipality",
      parent_key: "country:albania",
      review_status: "approved",
      boundary_source: "gisco_lau",
      boundary_version: "2023",
      match_method: "manual",
      confidence: 1,
      reviewer_note: "",
      binding_geography_id: null,
      binding_territorial_unit_id: null,
      parent_name: null,
    });
    const text = await childrenTopojson(
      [row("FIX-A", "child-a", "Alpha"), row("FIX-B", "child-b", "Beta")],
      indexFeatures(geometry),
    );
    const projected = projectChildren(JSON.parse(text));
    expect(projected.shapes.map((shape) => shape.jurisdictionKey).sort()).toEqual(["child-a", "child-b"]);
    expect(projected.outline.length).toBeGreaterThan(0);
  });
});

describe("world index map", () => {
  beforeEach(() => {
    const page = readFileSync(path.join(repoRoot, "app/atlas/page.tsx"), "utf8");
    const world = readFileSync(path.join(repoRoot, "components/atlas/map/WorldMap.tsx"), "utf8");
    expect(page).not.toMatch(/maplibre/);
    expect(world).not.toMatch(/maplibre/);
  });

  it("draws a static SVG and sizes markers by result rows", () => {
    const markers = buildWorldMarkers([
      {
        countryId: "albania",
        countryCode: "AL",
        name: "Albania",
        href: "/atlas/albania",
        resultRows: 100,
        coverage: recorded,
      },
      {
        countryId: "austria",
        countryCode: "AT",
        name: "Austria",
        href: "/atlas/austria",
        resultRows: 1,
        coverage: null,
      },
      {
        countryId: "unknown-land",
        countryCode: "ZZ",
        name: "No shape",
        href: "/atlas/unknown-land",
        resultRows: 9,
        coverage: recorded,
      },
    ]);
    expect(markers.map((marker) => marker.countryId).sort()).toEqual(["albania", "austria"]);
    const albania = markers.find((marker) => marker.countryId === "albania")!;
    const austria = markers.find((marker) => marker.countryId === "austria")!;
    expect(albania.radius).toBeGreaterThan(austria.radius);
    expect(worldMarkerRadius(0, 10)).toBeLessThan(worldMarkerRadius(10, 10));
    const html = markup(createElement(WorldMap, { markers }));
    expect(html).toContain('data-atlas-world-map="svg"');
    expect(html).toContain(ATTRIBUTIONS.natural_earth);
    expect(html).toContain('data-atlas-country="albania"');
    expect(html).toContain('data-atlas-result-rows="100"');
    expect(html).toContain('data-atlas-result-rows="1"');
    expect(html).not.toContain("unknown-land");
    expect(html).not.toContain("maplibre");
    const dynamic = readFileSync(path.join(repoRoot, "components/atlas/map/jurisdiction-map-dynamic.tsx"), "utf8");
    expect(dynamic).toContain("next/dynamic");
    expect(dynamic).toContain("ssr: false");
  });
});

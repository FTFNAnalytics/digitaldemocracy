"use client";

import type { FeatureCollection } from "geojson";
import type { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MaplibrePaint = {
  background: string;
  outline: string;
  navigate: string;
  hatch: string;
  steps: Record<1 | 2 | 3 | 4, string>;
  notSupplied: string;
};

function probeColor(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  const host = document.querySelector(".atlas") ?? document.body;
  host.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** Reads Atlas tokens at runtime so the WebGL style does not embed branding colours. */
export function readMaplibrePaint(): MaplibrePaint | null {
  const background = probeColor("--atlas-map");
  const outline = probeColor("--atlas-ink");
  const navigate = probeColor("--atlas-map");
  const hatch = probeColor("--atlas-map-none");
  const notSupplied = probeColor("--atlas-map-none");
  const steps = {
    1: probeColor("--atlas-coverage-1"),
    2: probeColor("--atlas-coverage-2"),
    3: probeColor("--atlas-coverage-3"),
    4: probeColor("--atlas-coverage-4"),
  } as const;
  if (!background || background === "rgba(0, 0, 0, 0)") return null;
  return { background, outline, navigate, hatch, steps, notSupplied };
}

function paintColor(paint: MaplibrePaint, step: number | "not_ingested" | "not_supplied"): string {
  if (step === "not_ingested") return paint.hatch;
  if (step === "not_supplied") return paint.notSupplied;
  if (step === 1 || step === 2 || step === 3 || step === 4) return paint.steps[step];
  return paint.navigate;
}

export async function mountMaplibre(args: {
  container: HTMLElement;
  shapes: FeatureCollection;
  outline: FeatureCollection;
  colors: Map<string, number | "not_ingested" | "not_supplied">;
  navigate: boolean;
  onHover: (id: string | null, point: { x: number; y: number } | null) => void;
  onSelect: (id: string) => void;
}): Promise<{ destroy: () => void; setColors: (colors: Map<string, number | "not_ingested" | "not_supplied">, navigate: boolean) => void } | null> {
  const paint = readMaplibrePaint();
  if (!paint) return null;
  const maplibre = await import("maplibre-gl");
  const features = args.shapes.features.map((item) => ({
    ...item,
    id: String(item.properties?.jurisdiction_key ?? item.id ?? ""),
  }));
  const map: MaplibreMap = new maplibre.Map({
    container: args.container,
    attributionControl: false,
    cooperativeGestures: true,
    style: {
      version: 8,
      sources: {
        children: { type: "geojson", data: { type: "FeatureCollection", features } },
        outline: { type: "geojson", data: args.outline },
      },
      layers: [
        { id: "ground", type: "background", paint: { "background-color": paint.background } },
        {
          id: "fills",
          type: "fill",
          source: "children",
          paint: {
            "fill-color": ["coalesce", ["feature-state", "fill"], paint.navigate],
            "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.85, 1],
          },
        },
        {
          id: "parent-outline",
          type: "line",
          source: "outline",
          paint: { "line-color": paint.outline, "line-width": 1.25 },
        },
      ],
    },
  });

  const apply = (colors: Map<string, number | "not_ingested" | "not_supplied">, navigate: boolean) => {
    for (const feature of features) {
      const id = String(feature.id ?? "");
      const step = navigate ? null : colors.get(id);
      const fill = navigate || step == null ? paint.navigate : paintColor(paint, step);
      map.setFeatureState({ source: "children", id }, { fill });
    }
  };

  let hovered: string | null = null;
  const selectHovered = (id: string | null) => {
    if (hovered === id) return;
    if (hovered) map.setFeatureState({ source: "children", id: hovered }, { hover: false });
    hovered = id;
    if (hovered) map.setFeatureState({ source: "children", id: hovered }, { hover: true });
  };

  map.on("load", () => {
    apply(args.colors, args.navigate);
    const bounds = new maplibre.LngLatBounds();
    let extended = false;
    for (const item of features) {
      const walk = (value: unknown) => {
        if (!Array.isArray(value)) return;
        if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
          bounds.extend([value[0], value[1]]);
          extended = true;
          return;
        }
        for (const child of value) walk(child);
      };
      walk(item.geometry);
    }
    if (extended) map.fitBounds(bounds, { padding: 16, animate: false });
  });

  map.on("mousemove", "fills", (event) => {
    const id = event.features?.[0]?.id;
    const key = id == null ? null : String(id);
    selectHovered(key);
    args.onHover(key, event.point ? { x: event.point.x, y: event.point.y } : null);
    map.getCanvas().style.cursor = key ? "pointer" : "";
  });
  map.on("mouseleave", "fills", () => {
    selectHovered(null);
    args.onHover(null, null);
    map.getCanvas().style.cursor = "";
  });
  map.on("click", "fills", (event) => {
    const id = event.features?.[0]?.id;
    if (id != null) args.onSelect(String(id));
  });

  return {
    destroy: () => {
      map.remove();
    },
    setColors: apply,
  };
}

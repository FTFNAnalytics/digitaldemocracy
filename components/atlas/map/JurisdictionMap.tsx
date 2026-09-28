"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Topology } from "topojson-specification";
import {
  childrenFeatureCollection,
  parentOutlineCollection,
  projectChildren,
  type ProjectedShape,
} from "@/lib/atlas/map/geometry";
import {
  chooseMapRenderer,
  COVERAGE_LEGEND,
  keyboardOpensShape,
  layerControls,
  marginUnitForLayer,
  NEXT_ELECTION_LEGEND,
  shapePaint,
  tooltipFields,
  webglAvailable,
  type MapLayerId,
  type MapPlace,
} from "@/lib/atlas/map/model";
import { NOT_SUPPLIED } from "../labels";

export function JurisdictionMap({
  parentLevel,
  topojsonUrl,
  topology,
  attribution,
  asOfYear,
  places,
  initialLayer = "navigate",
}: {
  parentLevel: string;
  topojsonUrl?: string | null;
  topology?: Topology | null;
  attribution: string | null;
  asOfYear: number;
  places: MapPlace[];
  initialLayer?: MapLayerId;
}) {
  const router = useRouter();
  const [fetched, setFetched] = useState<Topology | null>(null);
  const [missing, setMissing] = useState(false);
  const [layer, setLayer] = useState<MapLayerId>(initialLayer);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [webgl, setWebgl] = useState(false);
  const loaded = topology ?? fetched;

  useEffect(() => {
    if (topology || !topojsonUrl) return;
    let cancelled = false;
    void fetch(topojsonUrl)
      .then(async (response) => {
        if (!response.ok) throw new Error("missing topojson");
        return (await response.json()) as Topology;
      })
      .then((json) => {
        if (!cancelled) setFetched(json);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [topojsonUrl, topology]);

  const projected = useMemo(() => (loaded ? projectChildren(loaded) : null), [loaded]);
  const byId = useMemo(() => new Map(places.map((place) => [place.id, place])), [places]);
  const shapes = useMemo(
    () => (projected ? projected.shapes.filter((shape) => byId.has(shape.jurisdictionKey)) : []),
    [projected, byId],
  );
  const renderer = chooseMapRenderer({
    parentLevel,
    childLevels: places.map((place) => place.levelKey),
    approvedShapeCount: shapes.length,
  });
  const controls = layerControls(places);
  const active = controls.find((control) => control.id === layer && control.enabled) ? layer : "navigate";

  useEffect(() => {
    if (renderer !== "maplibre" || !loaded) return;
    if (!webglAvailable()) return;
    const container = document.getElementById("atlas-map-mount");
    if (!container) return;
    let cancelled = false;
    let handle: { destroy: () => void; setColors: (colors: Map<string, number | "not_ingested" | "not_supplied">, navigate: boolean) => void } | null = null;
    const colors = colorMap(shapes, byId, active, asOfYear);
    void import("./maplibre-view").then(async (mod) => {
      if (cancelled) return;
      handle = await mod.mountMaplibre({
        container,
        shapes: childrenFeatureCollection(loaded),
        outline: parentOutlineCollection(loaded),
        colors,
        navigate: active === "navigate",
        onHover: (id) => setHoverId(id),
        onSelect: (id) => {
          const place = byId.get(id);
          if (place) router.push(place.href);
        },
      });
      if (cancelled) {
        handle?.destroy();
        return;
      }
      if (handle) setWebgl(true);
    });
    return () => {
      cancelled = true;
      handle?.destroy();
      setWebgl(false);
    };
  }, [renderer, loaded, active, shapes, byId, asOfYear, router]);

  if (missing || (!topojsonUrl && !topology)) {
    return (
      <div data-atlas-map-state="pending" className="min-h-48 rounded-2xl border border-dashed border-atlas-line bg-atlas-map p-4">
        <p className="text-sm font-semibold text-atlas-ink">Map pending boundary review</p>
        <div id="atlas-map-mount" data-atlas-map-mount="" />
      </div>
    );
  }

  if (!projected) {
    return (
      <div data-atlas-map-loading="true" className="relative min-h-72 rounded-2xl border border-atlas-line bg-atlas-map p-4">
        <p className="text-sm text-atlas-ink">Loading boundary shapes</p>
        <div id="atlas-map-mount" data-atlas-map-mount="" />
      </div>
    );
  }

  if (renderer === "empty") {
    return (
      <div data-atlas-map-state="pending" className="min-h-48 rounded-2xl border border-dashed border-atlas-line bg-atlas-map p-4">
        <p className="text-sm font-semibold text-atlas-ink">Map pending boundary review</p>
        <div id="atlas-map-mount" data-atlas-map-mount="" />
      </div>
    );
  }

  const hovered = hoverId ? byId.get(hoverId) : undefined;

  return (
    <div
      data-atlas-renderer={renderer}
      data-atlas-webgl={webgl ? "on" : "off"}
      data-atlas-maplibre={webgl ? "ready" : "off"}
      className="relative"
    >
      <LayerBar controls={controls} active={active} onChange={setLayer} />
      <div className="relative min-h-72 overflow-hidden rounded-2xl border border-atlas-line bg-atlas-map">
        <svg
          data-atlas-map-svg="true"
          viewBox={projected.viewBox}
          role="img"
          aria-label="Child places"
          className="h-auto w-full"
        >
          <HatchPattern />
          {projected.outline ? (
            <path data-atlas-parent-outline="true" d={projected.outline} fill="none" stroke="var(--atlas-ink)" strokeWidth="1.5" />
          ) : null}
          {shapes.map((shape) => (
            <ShapeLink
              key={shape.jurisdictionKey}
              shape={shape}
              place={byId.get(shape.jurisdictionKey)!}
              layer={active}
              asOfYear={asOfYear}
            />
          ))}
        </svg>
        <div
          id="atlas-map-mount"
          data-atlas-map-mount=""
          className={renderer === "maplibre" ? "pointer-events-none absolute inset-0" : "hidden"}
        />
        {hovered ? <TooltipCard place={hovered} /> : null}
        {attribution ? (
          <p data-atlas-attribution="boundaries" className="pointer-events-none absolute bottom-2 right-2 max-w-[70%] text-[10px] leading-snug text-atlas-ink-2">
            {attribution}
          </p>
        ) : null}
      </div>
      <Legend layer={active} marginUnit={marginUnitForLayer(places)} />
    </div>
  );
}

function colorMap(
  shapes: ProjectedShape[],
  byId: Map<string, MapPlace>,
  layer: MapLayerId,
  asOfYear: number,
): Map<string, number | "not_ingested" | "not_supplied"> {
  const colors = new Map<string, number | "not_ingested" | "not_supplied">();
  for (const shape of shapes) {
    const place = byId.get(shape.jurisdictionKey);
    if (!place) continue;
    colors.set(shape.jurisdictionKey, shapePaint(place, layer, asOfYear));
  }
  return colors;
}

function fillFor(place: MapPlace, layer: MapLayerId, asOfYear: number): { fill: string; className: string } {
  if (layer === "navigate") return { fill: "var(--atlas-map)", className: "atlas-fill-navigate" };
  const paint = shapePaint(place, layer, asOfYear);
  if (paint === "not_ingested") return { fill: "url(#atlas-not-ingested)", className: "atlas-fill-hatch" };
  if (paint === "not_supplied") return { fill: "var(--atlas-map-none)", className: "atlas-fill-none" };
  return { fill: `var(--atlas-coverage-${paint})`, className: `atlas-fill-step-${paint}` };
}

function ShapeLink({
  shape,
  place,
  layer,
  asOfYear,
}: {
  shape: ProjectedShape;
  place: MapPlace;
  layer: MapLayerId;
  asOfYear: number;
}) {
  const fields = tooltipFields(place);
  const paint = fillFor(place, layer, asOfYear);
  return (
    <a
      href={place.href}
      data-atlas-shape={place.id}
      data-atlas-keyboard="tab-enter"
      className="atlas-map-shape"
      onKeyDown={(event) => {
        if (keyboardOpensShape(event.key)) return;
      }}
    >
      <title>{fields.map((field) => `${field.label}: ${field.value}`).join(". ")}</title>
      <path data-atlas-fill={place.id} d={shape.d} fill={paint.fill} className={paint.className} stroke="var(--atlas-line)" strokeWidth="0.75" />
      <foreignObject x={shape.cx} y={shape.cy} width="1" height="1" className="atlas-map-tip-anchor">
        <div className="atlas-map-tooltip">
          {fields.map((field) => (
            <span key={field.id} data-atlas-tooltip-field={field.id}>
              <span className="text-atlas-ink-2">{field.label}: </span>
              {field.value}
            </span>
          ))}
        </div>
      </foreignObject>
    </a>
  );
}

function TooltipCard({ place }: { place: MapPlace }) {
  const fields = tooltipFields(place);
  return (
    <div role="tooltip" data-atlas-hover-tooltip="true" className="atlas-map-tooltip atlas-map-tooltip-live">
      {fields.map((field) => (
        <span key={field.id} data-atlas-tooltip-field={field.id}>
          {field.label}: {field.value}
        </span>
      ))}
    </div>
  );
}

function LayerBar({
  controls,
  active,
  onChange,
}: {
  controls: ReturnType<typeof layerControls>;
  active: MapLayerId;
  onChange: (layer: MapLayerId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Map layer" className="mb-3 flex flex-wrap gap-2">
      {controls.map((control) => (
        <button
          key={control.id}
          type="button"
          role="radio"
          aria-checked={active === control.id}
          data-atlas-layer={control.id}
          disabled={!control.enabled}
          onClick={() => {
            if (control.enabled) onChange(control.id);
          }}
          className={
            active === control.id
              ? "rounded-full border border-atlas-accent bg-atlas-tint px-3 py-1 text-xs font-semibold text-atlas-ink"
              : "rounded-full border border-atlas-line bg-atlas-card px-3 py-1 text-xs font-semibold text-atlas-ink disabled:opacity-60"
          }
        >
          {control.label}
          {control.note ? <span data-atlas-layer-note={control.id}> {control.note}</span> : null}
        </button>
      ))}
    </div>
  );
}

function Legend({ layer, marginUnit }: { layer: MapLayerId; marginUnit: string | null }) {
  if (layer === "navigate") {
    return (
      <ul data-atlas-legend="navigate" aria-label="Navigate legend" className="mt-2 flex flex-wrap gap-3 text-xs text-atlas-ink">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 border border-atlas-line bg-atlas-map" />
          Place
        </li>
      </ul>
    );
  }
  if (layer === "coverage") {
    return (
      <ul data-atlas-legend="coverage" aria-label="Coverage legend" className="mt-2 flex flex-wrap gap-3 text-xs text-atlas-ink">
        {COVERAGE_LEGEND.map((step) => (
          <li key={step.step} data-atlas-step={step.step} data-atlas-mix={step.mix} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 border border-atlas-line" style={{ background: `var(--atlas-coverage-${step.step})` }} />
            {step.label}
          </li>
        ))}
        <li data-atlas-step="not-ingested" className="flex items-center gap-2">
          <span className="atlas-swatch-hatch inline-block h-3 w-3 border border-atlas-line" />
          Not ingested
        </li>
      </ul>
    );
  }
  if (layer === "next_election") {
    return (
      <ul data-atlas-legend="next_election" aria-label="Next election legend" className="mt-2 flex flex-wrap gap-3 text-xs text-atlas-ink">
        {NEXT_ELECTION_LEGEND.map((step) => (
          <li key={String(step.step)} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 border border-dashed border-atlas-line"
              style={{ background: step.step === "not_supplied" ? "var(--atlas-map-none)" : `var(--atlas-coverage-${step.step})` }}
            />
            {step.label}
          </li>
        ))}
      </ul>
    );
  }
  const unit = layer === "margin" && marginUnit === "proportion_0_1" ? "proportion" : "percent";
  const labels =
    unit === "proportion"
      ? ["Up to 0.25", "Up to 0.50", "Up to 0.75", "Above 0.75"]
      : ["Up to 25%", "Up to 50%", "Up to 75%", "Above 75%"];
  return (
    <ul data-atlas-legend={layer} aria-label={`${layer} legend`} className="mt-2 flex flex-wrap gap-3 text-xs text-atlas-ink">
      {labels.map((label, index) => (
        <li key={label} data-atlas-step={index + 1} data-atlas-mix={[18, 40, 64, 88][index]} className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 border border-atlas-line" style={{ background: `var(--atlas-coverage-${index + 1})` }} />
          {label}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 border border-dashed border-atlas-line bg-atlas-map-none" />
        {NOT_SUPPLIED}
      </li>
    </ul>
  );
}

function HatchPattern() {
  return (
    <defs>
      <pattern id="atlas-not-ingested" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="var(--atlas-map-none)" />
        <path d="M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6" stroke="var(--atlas-ink-2)" strokeWidth="1" />
      </pattern>
    </defs>
  );
}


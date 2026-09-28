import type { FeatureCollection } from "geojson";
import { feature, mesh } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";

export type ShapeProperties = {
  jurisdiction_key?: string;
  name?: string;
  level?: string;
};

type TopologyWithChildren = Topology;

export function childrenObject(topology: TopologyWithChildren): GeometryObject {
  for (const object of Object.values(topology.objects)) {
    if (object.type === "GeometryCollection") return object as GeometryObject;
  }
  throw new Error("TopoJSON has no child shapes");
}

export function childrenFeatureCollection(topology: TopologyWithChildren): FeatureCollection {
  const geo = feature(topology, childrenObject(topology));
  if (geo.type === "FeatureCollection") return geo;
  return { type: "FeatureCollection", features: [geo] };
}

export function parentOutlineCollection(topology: TopologyWithChildren): FeatureCollection {
  const lines = mesh(topology, childrenObject(topology), (a, b) => a === b);
  return {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: { role: "parent-outline" }, geometry: lines }],
  };
}

export function squaresTopology(
  rows: Array<{ jurisdictionKey: string; name: string; level: string }>,
): TopologyWithChildren {
  const arcs: number[][][] = [];
  const geometries = rows.map((row, index) => {
    const column = index % 10;
    const line = Math.floor(index / 10);
    const x = column * 2;
    const y = line * 2;
    const arcIndex = arcs.length;
    arcs.push([
      [x, y],
      [x + 1, y],
      [x + 1, y + 1],
      [x, y + 1],
      [x, y],
    ]);
    return {
      type: "Polygon" as const,
      arcs: [[arcIndex]],
      properties: {
        jurisdiction_key: row.jurisdictionKey,
        name: row.name,
        level: row.level,
      },
    };
  });
  return {
    type: "Topology",
    objects: {
      children: {
        type: "GeometryCollection",
        geometries,
      },
    },
    arcs,
  };
}

export type ProjectedShape = {
  jurisdictionKey: string;
  name: string;
  level: string;
  d: string;
  cx: number;
  cy: number;
};

type LngLat = [number, number];

function visitPositions(value: unknown, visit: (lon: number, lat: number) => void): void {
  if (!value) return;
  if (Array.isArray(value)) {
    if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
      visit(value[0], value[1]);
      return;
    }
    for (const child of value) visitPositions(child, visit);
    return;
  }
  if (typeof value === "object" && "coordinates" in value) {
    visitPositions((value as { coordinates: unknown }).coordinates, visit);
  }
}

function ringPath(
  ring: number[][],
  project: (lon: number, lat: number) => [number, number],
): { d: string; points: Array<[number, number]> } {
  const commands: string[] = [];
  const points: Array<[number, number]> = [];
  ring.forEach((position, index) => {
    const [x, y] = project(position[0] ?? 0, position[1] ?? 0);
    points.push([x, y]);
    commands.push(`${index === 0 ? "M" : "L"}${x} ${y}`);
  });
  if (commands.length > 0) commands.push("Z");
  return { d: commands.join(""), points };
}

function geometryPath(
  geometry: { type?: string; coordinates?: unknown } | null,
  project: (lon: number, lat: number) => [number, number],
): { d: string; points: Array<[number, number]> } {
  if (!geometry) return { d: "", points: [] };
  const chunks: string[] = [];
  const points: Array<[number, number]> = [];
  const addRing = (ring: number[][]) => {
    const drawn = ringPath(ring, project);
    if (drawn.d) chunks.push(drawn.d);
    points.push(...drawn.points);
  };
  if (geometry.type === "Polygon" && Array.isArray(geometry.coordinates)) {
    for (const ring of geometry.coordinates as number[][][]) addRing(ring);
  } else if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    for (const polygon of geometry.coordinates as number[][][][]) {
      for (const ring of polygon) addRing(ring);
    }
  } else if (geometry.type === "LineString" && Array.isArray(geometry.coordinates)) {
    addRing(geometry.coordinates as number[][]);
  } else if (geometry.type === "MultiLineString" && Array.isArray(geometry.coordinates)) {
    for (const line of geometry.coordinates as number[][][]) addRing(line);
  }
  return { d: chunks.join(""), points };
}

export function projectChildren(
  topology: TopologyWithChildren,
  width = 640,
  height = 420,
): { shapes: ProjectedShape[]; outline: string; viewBox: string } {
  const collection = childrenFeatureCollection(topology);
  const positions: LngLat[] = [];
  for (const item of collection.features) {
    visitPositions(item.geometry, (lon, lat) => positions.push([lon, lat]));
  }
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of positions) {
    if (lon < minLon) minLon = lon;
    if (lat < minLat) minLat = lat;
    if (lon > maxLon) maxLon = lon;
    if (lat > maxLat) maxLat = lat;
  }
  if (!Number.isFinite(minLon)) {
    return { shapes: [], outline: "", viewBox: `0 0 ${width} ${height}` };
  }
  const pad = 12;
  const spanLon = maxLon - minLon || 1;
  const spanLat = maxLat - minLat || 1;
  const project = (lon: number, lat: number): [number, number] => {
    const x = pad + ((lon - minLon) / spanLon) * (width - pad * 2);
    const y = pad + ((maxLat - lat) / spanLat) * (height - pad * 2);
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  };
  const shapes: ProjectedShape[] = [];
  for (const item of collection.features) {
    const properties = item.properties ?? {};
    const key = typeof properties.jurisdiction_key === "string" ? properties.jurisdiction_key : "";
    if (!key) continue;
    const drawn = geometryPath(item.geometry as { type?: string; coordinates?: unknown }, project);
    if (!drawn.d) continue;
    const cx = drawn.points.reduce((sum, point) => sum + point[0], 0) / drawn.points.length;
    const cy = drawn.points.reduce((sum, point) => sum + point[1], 0) / drawn.points.length;
    shapes.push({
      jurisdictionKey: key,
      name: typeof properties.name === "string" ? properties.name : key,
      level: typeof properties.level === "string" ? properties.level : "",
      d: drawn.d,
      cx: Math.round(cx * 10) / 10,
      cy: Math.round(cy * 10) / 10,
    });
  }
  const outlineGeo = parentOutlineCollection(topology);
  const outline = outlineGeo.features
    .map((item) => geometryPath(item.geometry, project).d)
    .join("");
  return { shapes, outline, viewBox: `0 0 ${width} ${height}` };
}

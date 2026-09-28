import { createRequire } from "node:module";
import { gunzipSync, gzipSync } from "node:zlib";
import { EUROPE_LAU_PMTILES_ATTRIBUTION } from "./attribution";
import type { CrosswalkRow, LevelLabel } from "./types";

const require = createRequire(import.meta.url);

type MapshaperApi = {
  applyCommands(argv: string, input?: Record<string, string>): Promise<Record<string, string | Buffer>>;
};

export const REGION_TOPOJSON_MAX_BYTES = 300 * 1024;
const METERS_PER_DEGREE = 111_320;
const TILE_EXTENT = 4096;

export function simplifyIntervalDegrees(level: LevelLabel): number {
  const meters = level === "municipality" || level === "ward" ? 10 : 50;
  return meters / METERS_PER_DEGREE;
}

export type GeoJsonFeature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  };
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

const CODE_PROPERTIES = ["boundary_code", "LAU_ID", "NUTS_ID", "GISCO_ID", "shapeISO", "shapeID"] as const;

export function featureBoundaryCode(feature: GeoJsonFeature): string | null {
  for (const key of CODE_PROPERTIES) {
    const value = feature.properties[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function indexFeatures(collection: FeatureCollection): Map<string, GeoJsonFeature> {
  const index = new Map<string, GeoJsonFeature>();
  for (const feature of collection.features) {
    const code = featureBoundaryCode(feature);
    if (!code) continue;
    if (index.has(code)) throw new Error(`geometry has more than one feature for ${code}`);
    index.set(code, feature);
  }
  return index;
}

export function topojsonFeatureCount(value: unknown): number {
  if (!value || typeof value !== "object") throw new Error("TopoJSON did not parse");
  const topology = value as { type?: string; objects?: Record<string, { type?: string; geometries?: unknown[] }> };
  if (topology.type !== "Topology" || !topology.objects) throw new Error("TopoJSON did not parse");
  let count = 0;
  for (const object of Object.values(topology.objects)) {
    if (object.type === "GeometryCollection") {
      if (!Array.isArray(object.geometries)) throw new Error("TopoJSON GeometryCollection has no geometries");
      count += object.geometries.length;
    } else {
      count += 1;
    }
  }
  return count;
}

export function finalizeChildrenTopojson(level: LevelLabel, text: string, expectedFeatures: number): string {
  const count = topojsonFeatureCount(JSON.parse(text) as unknown);
  if (count !== expectedFeatures) {
    throw new Error(`TopoJSON feature count ${count} does not equal approved row count ${expectedFeatures}`);
  }
  const bytes = Buffer.byteLength(text);
  if (level === "region" && bytes > REGION_TOPOJSON_MAX_BYTES) {
    throw new Error(`region TopoJSON is ${bytes} bytes; the limit is ${REGION_TOPOJSON_MAX_BYTES}`);
  }
  return text;
}

export async function childrenTopojson(rows: CrosswalkRow[], features: Map<string, GeoJsonFeature>): Promise<string> {
  if (rows.length === 0) throw new Error("refusing to emit an empty shape file");
  const level = rows[0]!.level;
  if (rows.some((row) => row.level !== level)) throw new Error("a children file must contain one level");
  const collection: FeatureCollection = {
    type: "FeatureCollection",
    features: rows.map((row) => {
      const feature = features.get(row.boundary_code);
      if (!feature) throw new Error(`no geometry for approved boundary code ${row.boundary_code}`);
      return {
        type: "Feature",
        properties: {
          boundary_code: row.boundary_code,
          jurisdiction_key: row.jurisdiction_key,
          name: row.name,
          level: row.level,
        },
        geometry: feature.geometry,
      };
    }),
  };
  const mapshaper = require("mapshaper") as MapshaperApi;
  const interval = simplifyIntervalDegrees(level);
  const output = await mapshaper.applyCommands(
    `-i children.geojson -simplify weighted interval=${interval} keep-shapes -o format=topojson quantization=100000 children.json`,
    { "children.geojson": JSON.stringify(collection) },
  );
  const raw = output["children.json"];
  if (raw === undefined) throw new Error("mapshaper did not return children.json");
  const text = typeof raw === "string" ? raw : raw.toString("utf8");
  return `${finalizeChildrenTopojson(level, text, rows.length)}\n`;
}

export type LngLatBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export function featureBBox(feature: GeoJsonFeature): LngLatBox {
  const box: LngLatBox = { minLon: Infinity, minLat: Infinity, maxLon: -Infinity, maxLat: -Infinity };
  visitPositions(feature.geometry.coordinates, (lon, lat) => {
    if (lon < box.minLon) box.minLon = lon;
    if (lat < box.minLat) box.minLat = lat;
    if (lon > box.maxLon) box.maxLon = lon;
    if (lat > box.maxLat) box.maxLat = lat;
  });
  if (!Number.isFinite(box.minLon)) throw new Error("feature has no coordinates");
  return box;
}

export function featureCentroid(feature: GeoJsonFeature): [number, number] {
  const geometry = feature.geometry;
  const rings: number[][][] = [];
  if (geometry.type === "Polygon") rings.push((geometry.coordinates as number[][][])[0] ?? []);
  if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates as number[][][][]) rings.push(polygon[0] ?? []);
  }
  let best = rings[0] ?? [];
  let bestArea = -1;
  for (const ring of rings) {
    const area = Math.abs(ringArea(ring));
    if (area > bestArea) {
      bestArea = area;
      best = ring;
    }
  }
  if (best.length === 0) throw new Error("feature has no exterior ring");
  let lon = 0;
  let lat = 0;
  const unique = best[0]![0] === best[best.length - 1]![0] && best[0]![1] === best[best.length - 1]![1] ? best.slice(0, -1) : best;
  for (const position of unique) {
    lon += position[0]!;
    lat += position[1]!;
  }
  return [lon / unique.length, lat / unique.length];
}

function ringArea(ring: number[][]): number {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const current = ring[index]!;
    const next = ring[index + 1]!;
    area += current[0]! * next[1]! - next[0]! * current[1]!;
  }
  return area / 2;
}

function visitPositions(value: unknown, visit: (lon: number, lat: number) => void): void {
  if (!Array.isArray(value)) return;
  if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
    visit(value[0], value[1]);
    return;
  }
  for (const child of value) visitPositions(child, visit);
}

function varint(value: number): Buffer {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error(`varint out of range: ${value}`);
  }
  const bytes: number[] = [];
  let remaining = value;
  while (remaining > 0x7f) {
    bytes.push((remaining & 0x7f) | 0x80);
    remaining >>>= 7;
  }
  bytes.push(remaining);
  return Buffer.from(bytes);
}

function concat(parts: Buffer[]): Buffer {
  return Buffer.concat(parts);
}

function key(field: number, wire: number): Buffer {
  return varint((field << 3) | wire);
}

function lengthField(field: number, data: Buffer): Buffer {
  return concat([key(field, 2), varint(data.length), data]);
}

function varField(field: number, value: number): Buffer {
  return concat([key(field, 0), varint(value)]);
}

function zigzag(value: number): number {
  if (!Number.isInteger(value)) throw new Error("geometry coordinate is not an integer");
  return value >= 0 ? value * 2 : -value * 2 - 1;
}

function project(lon: number, lat: number): [number, number] {
  const x = Math.round(((lon + 180) / 360) * TILE_EXTENT);
  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const sine = Math.sin((clampedLat * Math.PI) / 180);
  const y = Math.round((0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * TILE_EXTENT);
  return [Math.max(0, Math.min(TILE_EXTENT, x)), Math.max(0, Math.min(TILE_EXTENT, y))];
}

function encodeRing(ring: number[][]): number[] {
  const open = ring.length > 1 && ring[0]![0] === ring[ring.length - 1]![0] && ring[0]![1] === ring[ring.length - 1]![1]
    ? ring.slice(0, -1)
    : ring.slice();
  if (open.length < 3) throw new Error("polygon ring has fewer than 3 positions");
  const commands: number[] = [];
  let cursorX = 0;
  let cursorY = 0;
  open.forEach((position, index) => {
    const [x, y] = project(position[0]!, position[1]!);
    const dx = x - cursorX;
    const dy = y - cursorY;
    cursorX = x;
    cursorY = y;
    if (index === 0) {
      commands.push((1 << 3) | 1, zigzag(dx), zigzag(dy));
      return;
    }
    if (index === 1) commands.push((2 << 3) | (open.length - 1));
    commands.push(zigzag(dx), zigzag(dy));
  });
  commands.push((7 << 3) | 1);
  return commands;
}

function encodeMvt(features: GeoJsonFeature[]): Buffer {
  const keys = ["boundary_code", "jurisdiction_key", "name"];
  const values = features.flatMap((feature) => [
    Buffer.from(String(feature.properties.boundary_code ?? ""), "utf8"),
    Buffer.from(String(feature.properties.jurisdiction_key ?? ""), "utf8"),
    Buffer.from(String(feature.properties.name ?? ""), "utf8"),
  ]);
  const featureMessages = features.map((feature, index) => {
    const base = index * 3;
    const geometry = feature.geometry;
    const rings: number[][][] = [];
    if (geometry.type === "Polygon") rings.push(...(geometry.coordinates as number[][][]));
    else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates as number[][][][]) rings.push(...polygon);
    } else throw new Error(`unsupported geometry type ${geometry.type}`);
    const commands = rings.flatMap((ring) => encodeRing(ring));
    const tags = [0, base, 1, base + 1, 2, base + 2];
    return lengthField(
      2,
      concat([
        varField(1, index + 1),
        lengthField(2, concat(tags.map((tag) => varint(tag)))),
        varField(3, 3),
        lengthField(4, concat(commands.map((command) => varint(command)))),
      ]),
    );
  });
  const layer = concat([
    lengthField(1, Buffer.from("boundaries", "utf8")),
    ...featureMessages,
    ...keys.map((name) => lengthField(3, Buffer.from(name, "utf8"))),
    ...values.map((value) => lengthField(4, lengthField(1, value))),
    varField(5, TILE_EXTENT),
    varField(15, 2),
  ]);
  return lengthField(3, layer);
}

export function countMvtPolygons(tile: Buffer): number {
  const decoded = readLayer(tile);
  return decoded.filter((type) => type === 3).length;
}

function readVarint(buffer: Buffer, offset: number): { value: number; offset: number } {
  let result = 0;
  let shift = 0;
  let cursor = offset;
  while (cursor < buffer.length && shift <= 28) {
    const byte = buffer[cursor]!;
    cursor += 1;
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return { value: result >>> 0, offset: cursor };
    shift += 7;
  }
  throw new Error("truncated varint");
}

function readLayer(tile: Buffer): number[] {
  let offset = 0;
  const types: number[] = [];
  while (offset < tile.length) {
    const tag = readVarint(tile, offset);
    offset = tag.offset;
    const field = tag.value >> 3;
    const wire = tag.value & 7;
    if (wire !== 2) throw new Error("unexpected tile wire type");
    const length = readVarint(tile, offset);
    offset = length.offset;
    const message = tile.subarray(offset, offset + length.value);
    offset += length.value;
    if (field === 3) types.push(...readFeatureTypes(message));
  }
  return types;
}

function readFeatureTypes(layer: Buffer): number[] {
  let offset = 0;
  const types: number[] = [];
  while (offset < layer.length) {
    const tag = readVarint(layer, offset);
    offset = tag.offset;
    const field = tag.value >> 3;
    const wire = tag.value & 7;
    if (wire === 0) {
      const value = readVarint(layer, offset);
      offset = value.offset;
      continue;
    }
    if (wire !== 2) throw new Error("unexpected layer wire type");
    const length = readVarint(layer, offset);
    offset = length.offset;
    const message = layer.subarray(offset, offset + length.value);
    offset += length.value;
    if (field === 2) types.push(readGeomType(message));
  }
  return types;
}

function readGeomType(feature: Buffer): number {
  let offset = 0;
  let type = 0;
  while (offset < feature.length) {
    const tag = readVarint(feature, offset);
    offset = tag.offset;
    const field = tag.value >> 3;
    const wire = tag.value & 7;
    if (wire === 0) {
      const value = readVarint(feature, offset);
      offset = value.offset;
      if (field === 3) type = value.value;
      continue;
    }
    const length = readVarint(feature, offset);
    offset = length.offset + length.value;
  }
  return type;
}

function encodeDirectory(entries: { tileId: number; runLength: number; length: number; offset: number }[]): Buffer {
  const parts: Buffer[] = [varint(entries.length)];
  let lastId = 0;
  for (const entry of entries) {
    parts.push(varint(entry.tileId - lastId));
    lastId = entry.tileId;
  }
  for (const entry of entries) parts.push(varint(entry.runLength));
  for (const entry of entries) parts.push(varint(entry.length));
  let nextByte = 0;
  entries.forEach((entry, index) => {
    if (index > 0 && entry.offset === nextByte) parts.push(varint(0));
    else parts.push(varint(entry.offset + 1));
    nextByte = entry.offset + entry.length;
  });
  return concat(parts);
}

function writeU64(buffer: Buffer, offset: number, value: number): void {
  buffer.writeUInt32LE(value >>> 0, offset);
  buffer.writeUInt32LE(Math.floor(value / 2 ** 32), offset + 4);
}

function writePosition(buffer: Buffer, offset: number, lon: number, lat: number): void {
  buffer.writeInt32LE(Math.round(lon * 1e7), offset);
  buffer.writeInt32LE(Math.round(lat * 1e7), offset + 4);
}

export function buildEuropeLauPmtiles(features: GeoJsonFeature[]): Buffer {
  if (features.length === 0) throw new Error("refusing to emit an empty PMTiles archive");
  const tile = gzipSync(encodeMvt(features));
  const directory = encodeDirectory([{ tileId: 0, runLength: 1, length: tile.length, offset: 0 }]);
  const boxes = features.map((feature) => featureBBox(feature));
  const bounds = boxes.reduce(
    (box, next) => ({
      minLon: Math.min(box.minLon, next.minLon),
      minLat: Math.min(box.minLat, next.minLat),
      maxLon: Math.max(box.maxLon, next.maxLon),
      maxLat: Math.max(box.maxLat, next.maxLat),
    }),
    { minLon: Infinity, minLat: Infinity, maxLon: -Infinity, maxLat: -Infinity },
  );
  const metadata = Buffer.from(
    JSON.stringify({
      name: "europe-lau",
      description: "Approved GISCO LAU features only. Draft and rejected crosswalk rows are omitted.",
      attribution: EUROPE_LAU_PMTILES_ATTRIBUTION,
      vector_layers: [
        {
          id: "boundaries",
          fields: {
            boundary_code: "String",
            jurisdiction_key: "String",
            name: "String",
          },
        },
      ],
    }),
    "utf8",
  );
  const headerLength = 127;
  const rootOffset = headerLength;
  const metadataOffset = rootOffset + directory.length;
  const tileOffset = metadataOffset + metadata.length;
  const header = Buffer.alloc(headerLength);
  header.write("PMTiles", 0, "utf8");
  header.writeUInt8(3, 7);
  writeU64(header, 8, rootOffset);
  writeU64(header, 16, directory.length);
  writeU64(header, 24, metadataOffset);
  writeU64(header, 32, metadata.length);
  writeU64(header, 40, 0);
  writeU64(header, 48, 0);
  writeU64(header, 56, tileOffset);
  writeU64(header, 64, tile.length);
  writeU64(header, 72, 1);
  writeU64(header, 80, 1);
  writeU64(header, 88, 1);
  header.writeUInt8(1, 96);
  header.writeUInt8(1, 97);
  header.writeUInt8(2, 98);
  header.writeUInt8(1, 99);
  header.writeUInt8(0, 100);
  header.writeUInt8(0, 101);
  writePosition(header, 102, bounds.minLon, bounds.minLat);
  writePosition(header, 110, bounds.maxLon, bounds.maxLat);
  header.writeUInt8(0, 118);
  writePosition(header, 119, (bounds.minLon + bounds.maxLon) / 2, (bounds.minLat + bounds.maxLat) / 2);
  return concat([header, directory, metadata, tile]);
}

export function readPmtilesTile(archive: Buffer): Buffer {
  if (archive.subarray(0, 7).toString("utf8") !== "PMTiles") throw new Error("PMTiles magic is missing");
  if (archive.readUInt8(7) !== 3) throw new Error("PMTiles version is not 3");
  const tileOffset = archive.readUInt32LE(56);
  const tileLength = archive.readUInt32LE(64);
  const compression = archive.readUInt8(98);
  const tile = archive.subarray(tileOffset, tileOffset + tileLength);
  if (compression === 2) return gunzipSync(tile);
  if (compression === 1) return tile;
  throw new Error(`unsupported PMTiles tile compression ${compression}`);
}

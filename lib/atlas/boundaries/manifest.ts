import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "node:fs";
import { rename, rm } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import { BOUNDARY_SOURCES, type BoundarySource } from "./types";

export type ManifestSource = {
  id: string;
  boundary_source: BoundarySource;
  boundary_version: string;
  url: string;
  filename: string;
  sha256: string;
  bytes: number;
  role: "attributes" | "geometry";
  licence: string;
  attribution: string;
  checksum_note?: string;
};

export type BoundaryManifest = {
  note: string;
  sources: ManifestSource[];
};

export function parseManifest(value: unknown): BoundaryManifest {
  if (!value || typeof value !== "object") throw new Error("boundary manifest is not an object");
  const manifest = value as { note?: unknown; sources?: unknown };
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) {
    throw new Error("boundary manifest has no sources");
  }
  const sources = manifest.sources.map((entry, index) => parseSource(entry, index));
  const ids = new Set<string>();
  for (const source of sources) {
    if (ids.has(source.id)) throw new Error(`duplicate manifest id ${source.id}`);
    ids.add(source.id);
    assertNotGadm(source);
  }
  return {
    note: typeof manifest.note === "string" ? manifest.note : "",
    sources,
  };
}

function parseSource(value: unknown, index: number): ManifestSource {
  if (!value || typeof value !== "object") throw new Error(`manifest source ${index} is not an object`);
  const source = value as Record<string, unknown>;
  const boundarySource = source.boundary_source;
  if (typeof boundarySource !== "string" || !(BOUNDARY_SOURCES as readonly string[]).includes(boundarySource)) {
    throw new Error(`manifest source ${index} has an invalid boundary_source`);
  }
  const role = source.role;
  if (role !== "attributes" && role !== "geometry") throw new Error(`manifest source ${index} has an invalid role`);
  const sha256 = requiredString(source.sha256, "sha256");
  if (!/^[0-9a-f]{64}$/.test(sha256)) throw new Error(`manifest source ${index} sha256 is not 64 hex characters`);
  const bytes = source.bytes;
  if (typeof bytes !== "number" || !Number.isInteger(bytes) || bytes <= 0) {
    throw new Error(`manifest source ${index} bytes must be a positive integer`);
  }
  const url = requiredString(source.url, "url");
  if (!url.startsWith("https://")) throw new Error(`manifest source ${index} url must be https`);
  return {
    id: requiredString(source.id, "id"),
    boundary_source: boundarySource as BoundarySource,
    boundary_version: requiredString(source.boundary_version, "boundary_version"),
    url,
    filename: requiredString(source.filename, "filename"),
    sha256,
    bytes,
    role,
    licence: requiredString(source.licence, "licence"),
    attribution: requiredString(source.attribution, "attribution"),
    ...(typeof source.checksum_note === "string" && source.checksum_note.trim()
      ? { checksum_note: source.checksum_note }
      : {}),
  };
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`manifest ${label} is missing`);
  return value;
}

export function assertNotGadm(source: Pick<ManifestSource, "id" | "url" | "filename" | "licence" | "attribution">): void {
  const haystack = `${source.id} ${source.url} ${source.filename} ${source.licence} ${source.attribution}`.toLowerCase();
  if (haystack.includes("gadm")) {
    throw new Error("GADM is not a boundary source; its licence is non-commercial");
  }
}

export function hashBuffer(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function hashFile(filePath: string): Promise<{ sha256: string; bytes: number }> {
  const hash = createHash("sha256");
  let bytes = 0;
  const stream = createReadStream(filePath);
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    hash.update(buffer);
  }
  return { sha256: hash.digest("hex"), bytes };
}

export async function ensureManifestSource(
  source: ManifestSource,
  incomingDir: string,
): Promise<{ path: string; skipped: boolean }> {
  assertNotGadm(source);
  mkdirSync(incomingDir, { recursive: true });
  const destination = path.join(incomingDir, source.filename);
  if (existsSync(destination)) {
    const hashed = await hashFile(destination);
    if (hashed.sha256 === source.sha256 && hashed.bytes === source.bytes) {
      return { path: destination, skipped: true };
    }
  }
  return { path: await downloadManifestSource(source, incomingDir), skipped: false };
}

export async function downloadManifestSource(source: ManifestSource, incomingDir: string): Promise<string> {
  assertNotGadm(source);
  mkdirSync(incomingDir, { recursive: true });
  const destination = path.join(incomingDir, source.filename);
  const temporary = `${destination}.partial`;
  const response = await fetch(source.url);
  if (!response.ok || !response.body) {
    throw new Error(`download failed for ${source.id}: HTTP ${response.status}`);
  }
  await pipeline(Readable.fromWeb(response.body as NodeReadableStream), createWriteStream(temporary));
  const hashed = await hashFile(temporary);
  if (hashed.sha256 !== source.sha256 || hashed.bytes !== source.bytes) {
    await rm(temporary, { force: true });
    throw new Error(
      `checksum mismatch for ${source.id}: expected ${source.sha256} (${source.bytes} bytes), got ${hashed.sha256} (${hashed.bytes} bytes)`,
    );
  }
  await rename(temporary, destination);
  return destination;
}

import { createHash } from "node:crypto";

/**
 * Minimal POSIX ustar extractor. Used for packed country payloads (gzip then tar).
 * Rejects absolute paths and parent-directory segments.
 */
export function extractUstar(buffer: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  let offset = 0;
  const decoder = new TextDecoder("utf-8");
  const readString = (block: Buffer, start: number, length: number) => {
    const slice = block.subarray(start, start + length);
    const end = slice.indexOf(0);
    return decoder.decode(end === -1 ? slice : slice.subarray(0, end)).trim();
  };
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = readString(header, 0, 100);
    if (!name) break;
    const sizeText = readString(header, 124, 12);
    const size = Number.parseInt(sizeText, 8);
    if (!Number.isFinite(size) || size < 0) {
      throw new Error(`Invalid tar size for ${name}`);
    }
    const typeflag = String.fromCharCode(header[156] || 0);
    const prefix = readString(header, 345, 155);
    const full = (prefix ? `${prefix}/${name}` : name).replace(/^\.\//, "");
    if (full.startsWith("/") || full.split(/[\\/]/).includes("..")) {
      throw new Error(`Unsafe tar path ${full}`);
    }
    offset += 512;
    const content = buffer.subarray(offset, offset + size);
    offset += Math.ceil(size / 512) * 512;
    if (typeflag === "5" || full.endsWith("/")) continue;
    if (typeflag === "0" || typeflag === "\0" || typeflag === "") {
      files.set(full, Buffer.from(content));
    }
  }
  return files;
}

export function sha256(bytes: Buffer | Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

import { createHash } from "node:crypto";
import { closeSync, createReadStream, fstatSync, openSync, readSync } from "node:fs";
import { Readable } from "node:stream";
import { StringDecoder } from "node:string_decoder";
import { createGunzip, createInflateRaw } from "node:zlib";

const EOCD_SIG = 0x06054b50;
const ZIP64_EOCD_SIG = 0x06064b50;
const ZIP64_LOCATOR_SIG = 0x07064b50;
const CD_SIG = 0x02014b50;
const LOCAL_SIG = 0x04034b50;
const ZIP64_EXTRA_ID = 0x0001;

export type ZipMember = {
  name: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  localOffset: number;
};

function bigToNumber(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label} exceeds what this reader can address`);
  }
  return Number(value);
}

function readAt(fd: number, length: number, position: number): Buffer {
  const buf = Buffer.alloc(length);
  let offset = 0;
  while (offset < length) {
    const n = readSync(fd, buf, offset, length - offset, position + offset);
    if (n === 0) throw new Error(`Unexpected end of ZIP at byte ${position + offset}`);
    offset += n;
  }
  return buf;
}

function findEocd(tail: Buffer): number {
  for (let i = tail.length - 22; i >= 0; i -= 1) {
    if (tail.readUInt32LE(i) === EOCD_SIG) return i;
  }
  return -1;
}

function zip64Extra(extra: Buffer, compressedIs64: boolean, uncompressedIs64: boolean, offsetIs64: boolean): {
  compressedSize?: number;
  uncompressedSize?: number;
  localOffset?: number;
} {
  let p = 0;
  while (p + 4 <= extra.length) {
    const id = extra.readUInt16LE(p);
    const size = extra.readUInt16LE(p + 2);
    const start = p + 4;
    const end = start + size;
    if (end > extra.length) break;
    if (id === ZIP64_EXTRA_ID) {
      let q = start;
      const out: { compressedSize?: number; uncompressedSize?: number; localOffset?: number } = {};
      if (uncompressedIs64) {
        out.uncompressedSize = bigToNumber(extra.readBigUInt64LE(q), "ZIP64 uncompressed size");
        q += 8;
      }
      if (compressedIs64) {
        out.compressedSize = bigToNumber(extra.readBigUInt64LE(q), "ZIP64 compressed size");
        q += 8;
      }
      if (offsetIs64) {
        out.localOffset = bigToNumber(extra.readBigUInt64LE(q), "ZIP64 local header offset");
      }
      return out;
    }
    p = end;
  }
  return {};
}

/**
 * Read the central directory of a ZIP, including ZIP64 offsets.
 * File bytes are not loaded; callers stream one member at a time.
 */
export function listZipMembers(filePath: string): ZipMember[] {
  const fd = openSync(filePath, "r");
  try {
    const size = fstatSync(fd).size;
    if (size < 22) throw new Error("File is too small to be a ZIP");
    const tailSize = Math.min(size, 22 + 65535 + 20);
    const tail = readAt(fd, tailSize, size - tailSize);
    const eocd = findEocd(tail);
    if (eocd < 0) throw new Error("ZIP end of central directory not found");

    let entryCount = tail.readUInt16LE(eocd + 8);
    let cdSize = BigInt(tail.readUInt32LE(eocd + 12));
    let cdOffset = BigInt(tail.readUInt32LE(eocd + 16));
    const uint32Max = BigInt(0xffffffff);
    const needsZip64 = entryCount === 0xffff || cdSize === uint32Max || cdOffset === uint32Max;
    if (needsZip64) {
      if (eocd < 20) throw new Error("ZIP64 locator is missing");
      const loc = eocd - 20;
      if (tail.readUInt32LE(loc) !== ZIP64_LOCATOR_SIG) {
        throw new Error("ZIP64 end-of-central-directory locator is missing");
      }
      const z64Offset = bigToNumber(tail.readBigUInt64LE(loc + 8), "ZIP64 EOCD offset");
      const z64 = readAt(fd, 56, z64Offset);
      if (z64.readUInt32LE(0) !== ZIP64_EOCD_SIG) throw new Error("ZIP64 end of central directory is missing");
      entryCount = bigToNumber(z64.readBigUInt64LE(32), "ZIP64 entry count");
      cdSize = z64.readBigUInt64LE(40);
      cdOffset = z64.readBigUInt64LE(48);
    }

    const cdBytes = bigToNumber(cdSize, "central directory");
    if (cdBytes > 64 * 1024 * 1024) {
      throw new Error("ZIP central directory is larger than 64MB");
    }
    const cd = readAt(fd, cdBytes, bigToNumber(cdOffset, "central directory offset"));
    const members: ZipMember[] = [];
    let p = 0;
    for (let n = 0; n < entryCount; n += 1) {
      if (p + 46 > cd.length || cd.readUInt32LE(p) !== CD_SIG) {
        throw new Error("ZIP central directory is truncated");
      }
      const method = cd.readUInt16LE(p + 10);
      let compressedSize = cd.readUInt32LE(p + 20);
      let uncompressedSize = cd.readUInt32LE(p + 24);
      const nameLen = cd.readUInt16LE(p + 28);
      const extraLen = cd.readUInt16LE(p + 30);
      const commentLen = cd.readUInt16LE(p + 32);
      let localOffset = cd.readUInt32LE(p + 42);
      const nameStart = p + 46;
      const name = cd.toString("utf8", nameStart, nameStart + nameLen).replace(/\\/g, "/");
      const extra = cd.subarray(nameStart + nameLen, nameStart + nameLen + extraLen);
      const wide = zip64Extra(extra, compressedSize === 0xffffffff, uncompressedSize === 0xffffffff, localOffset === 0xffffffff);
      if (wide.compressedSize != null) compressedSize = wide.compressedSize;
      if (wide.uncompressedSize != null) uncompressedSize = wide.uncompressedSize;
      if (wide.localOffset != null) localOffset = wide.localOffset;
      if (!name.endsWith("/")) {
        members.push({ name: name.replace(/^\.\//, ""), method, compressedSize, uncompressedSize, localOffset });
      }
      p = nameStart + nameLen + extraLen + commentLen;
    }
    return members;
  } finally {
    closeSync(fd);
  }
}

export function findZipMember(members: ZipMember[], name: string): ZipMember {
  const want = name.replace(/\\/g, "/").replace(/^\.\//, "");
  const hits = members.filter((member) => member.name === want || member.name.endsWith(`/${want}`));
  if (hits.length !== 1) {
    throw new Error(`Expected one ZIP member ${want}, found ${hits.length}`);
  }
  return hits[0]!;
}

/**
 * One top directory shared by every member (`Peru_Prompt_BK_2026-10-31/`), or "".
 * A pack whose files already sit at the ZIP root has no prefix.
 */
export function packPrefix(members: ZipMember[]): string {
  if (members.length === 0) return "";
  const tops = new Set(
    members.map((member) => {
      const slash = member.name.indexOf("/");
      return slash === -1 ? "" : member.name.slice(0, slash + 1);
    }),
  );
  if (tops.size !== 1) return "";
  const top = [...tops][0] ?? "";
  if (!top) return "";
  return members.every((member) => member.name.startsWith(top)) ? top : "";
}

export function memberAt(members: ZipMember[], prefix: string, relative: string): ZipMember | null {
  const full = `${prefix}${relative}`;
  return members.find((member) => member.name === full) ?? null;
}

function memberByteStream(filePath: string, member: ZipMember): Readable {
  if (member.method !== 0 && member.method !== 8) {
    throw new Error(`Unsupported ZIP method ${member.method} for ${member.name}`);
  }
  const fd = openSync(filePath, "r");
  try {
    const header = readAt(fd, 30, member.localOffset);
    if (header.readUInt32LE(0) !== LOCAL_SIG) throw new Error(`Bad local header for ${member.name}`);
    const nameLen = header.readUInt16LE(26);
    const extraLen = header.readUInt16LE(28);
    const dataStart = member.localOffset + 30 + nameLen + extraLen;
    if (member.compressedSize === 0) return Readable.from([]);
    const raw = createReadStream(filePath, {
      start: dataStart,
      end: dataStart + member.compressedSize - 1,
    });
    if (member.method === 0) return raw;
    return raw.pipe(createInflateRaw());
  } finally {
    closeSync(fd);
  }
}

async function consume(stream: Readable, onChunk: (chunk: Buffer) => void): Promise<void> {
  try {
    for await (const chunk of stream) onChunk(chunk as Buffer);
  } finally {
    stream.destroy();
  }
}

/** SHA-256 of the member bytes as stored in the pack (gzip bytes stay gzip). */
export async function hashZipMember(filePath: string, member: ZipMember): Promise<string> {
  const hash = createHash("sha256");
  await consume(memberByteStream(filePath, member), (chunk) => {
    hash.update(chunk);
  });
  return hash.digest("hex");
}

export async function readZipMemberText(filePath: string, member: ZipMember, maxBytes = 20 * 1024 * 1024): Promise<string> {
  const decoder = new StringDecoder("utf8");
  let text = "";
  let bytes = 0;
  await consume(memberByteStream(filePath, member), (chunk) => {
    bytes += chunk.length;
    if (bytes > maxBytes) throw new Error(`${member.name} exceeds the ${maxBytes} byte text limit`);
    text += decoder.write(chunk);
  });
  text += decoder.end();
  return text;
}

/** Unzip one member and gunzip it when the pack stored a `.gz` file. */
export function openZipMemberTextStream(filePath: string, member: ZipMember): Readable {
  const bytes = memberByteStream(filePath, member);
  if (member.name.endsWith(".gz")) return bytes.pipe(createGunzip());
  return bytes;
}

export async function forEachTextLine(
  stream: Readable,
  onLine: (line: string, lineNumber: number) => void | Promise<void>,
): Promise<number> {
  const decoder = new StringDecoder("utf8");
  let pending = "";
  let lineNumber = 0;
  const take = async (line: string, final: boolean) => {
    if (!final && line.endsWith("\r")) line = line.slice(0, -1);
    if (lineNumber === 0 && line.charCodeAt(0) === 0xfeff) line = line.slice(1);
    if (!line.trim()) return;
    lineNumber += 1;
    await onLine(line, lineNumber);
  };
  try {
    for await (const chunk of stream) {
      pending += decoder.write(chunk as Buffer);
      let nl = pending.indexOf("\n");
      while (nl >= 0) {
        const line = pending.slice(0, nl);
        pending = pending.slice(nl + 1);
        await take(line, false);
        nl = pending.indexOf("\n");
      }
    }
    pending += decoder.end();
    if (pending.length) await take(pending, true);
    return lineNumber;
  } finally {
    stream.destroy();
  }
}

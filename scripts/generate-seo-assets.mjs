import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const NAVY = "#0a192f";
const ACCENT = "#a2ff00";

function xml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapLines(text, maxChars, maxLines = 3) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.…]*$/, "")}…`;
  return kept;
}

const NODES = [
  [920, 150, 7],
  [1008, 198, 12],
  [1110, 156, 7],
  [968, 302, 10],
  [1100, 292, 8],
  [1040, 420, 11],
  [900, 398, 7],
  [1154, 378, 8],
  [1178, 240, 5],
  [872, 248, 6],
  [1126, 508, 6],
  [980, 520, 5],
];

const EDGES = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [3, 5],
  [0, 6],
  [6, 3],
  [2, 4],
  [5, 7],
  [4, 7],
  [8, 2],
  [9, 0],
  [9, 3],
  [5, 10],
  [7, 10],
  [5, 11],
];

function networkMotif() {
  const lines = EDGES.map(([a, b]) => {
    const [x1, y1] = NODES[a];
    const [x2, y2] = NODES[b];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ACCENT}" stroke-width="1.6" stroke-opacity="0.45"/>`;
  }).join("");
  const dots = NODES.map(
    ([x, y, r], i) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${ACCENT}" opacity="${i === 1 ? 1 : 0.92}"/>`,
  ).join("");
  return `${lines}${dots}`;
}

function ogSvg({ title, subtitle, badge }) {
  const titleLines = wrapLines(title, 22, 3);
  const titleSize = titleLines.some((line) => line.length > 24) ? 46 : 58;
  const titleTspans = titleLines
    .map((line, index) => {
      const dy = index === 0 ? 0 : titleSize * 1.12;
      return `<tspan x="64" dy="${dy}">${xml(line)}</tspan>`;
    })
    .join("");
  const subtitleLines = subtitle ? wrapLines(subtitle, 48, 2) : [];
  const subtitleTspans = subtitleLines
    .map((line, index) => {
      const dy = index === 0 ? 0 : 30;
      return `<tspan x="64" dy="${dy}">${xml(line)}</tspan>`;
    })
    .join("");
  const badgeY = 156;
  const titleY = badge ? 230 : 196;
  const subtitleY = titleY + titleLines.length * titleSize * 1.12 + 28;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="78%" cy="42%" r="48%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${NAVY}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="1.2" cy="1.2" r="1.1" fill="${ACCENT}" opacity="0.14"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="${NAVY}"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="6" fill="${ACCENT}"/>
  <circle cx="1080" cy="300" r="230" fill="none" stroke="${ACCENT}" stroke-opacity="0.16" stroke-width="2"/>
  <circle cx="1080" cy="300" r="158" fill="none" stroke="${ACCENT}" stroke-opacity="0.28" stroke-width="2"/>
  <ellipse cx="1080" cy="300" rx="70" ry="158" fill="none" stroke="${ACCENT}" stroke-opacity="0.18" stroke-width="1.5"/>
  ${networkMotif()}
  <g>
    <circle cx="90" cy="78" r="26" fill="${NAVY}" stroke="${ACCENT}" stroke-width="2.4"/>
    <circle cx="90" cy="78" r="7" fill="${ACCENT}"/>
    <circle cx="74" cy="66" r="3.2" fill="${ACCENT}"/>
    <circle cx="106" cy="90" r="3.2" fill="${ACCENT}"/>
    <path d="M76.4 67.6L84.2 73.6M103.6 87.6L96.2 81.2" stroke="${ACCENT}" stroke-width="1.5" stroke-linecap="round"/>
    <text x="132" y="72" fill="${ACCENT}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="700" letter-spacing="3.4">CENTER FOR DIGITAL DEMOCRACY</text>
    <text x="132" y="96" fill="#ffffff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="700">Networked public-interest research</text>
  </g>
  ${
    badge
      ? `<rect x="64" y="${badgeY}" rx="16" ry="16" width="${Math.max(120, badge.length * 11 + 32)}" height="32" fill="${ACCENT}"/>
    <text x="${64 + Math.max(120, badge.length * 11 + 32) / 2}" y="${badgeY + 21}" text-anchor="middle" fill="#142200" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="2">${xml(badge)}</text>`
      : ""
  }
  <text x="64" y="${titleY}" fill="#ffffff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${titleSize}" font-weight="800">${titleTspans}</text>
  ${
    subtitle
      ? `<text x="64" y="${subtitleY}" fill="#ffffff" fill-opacity="0.74" font-family="ui-sans-serif, system-ui, sans-serif" font-size="24">${subtitleTspans}</text>`
      : ""
  }
  <text x="64" y="584" fill="${ACCENT}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" letter-spacing="0.6">center4digitaldemocracy.com</text>
</svg>`;
}

function markSvg(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="16" fill="${NAVY}"/>
  <circle cx="16" cy="16" r="10.6" stroke="${ACCENT}" stroke-width="1.3" opacity="0.32"/>
  <circle cx="16" cy="16" r="7.2" stroke="${ACCENT}" stroke-width="1.7"/>
  <circle cx="16" cy="16" r="2.45" fill="${ACCENT}"/>
  <circle cx="8.1" cy="10.1" r="1.55" fill="${ACCENT}"/>
  <circle cx="24.7" cy="11.3" r="1.3" fill="${ACCENT}"/>
  <circle cx="23.9" cy="22.7" r="1.5" fill="${ACCENT}"/>
  <circle cx="10.3" cy="23.3" r="1.15" fill="${ACCENT}"/>
  <path d="M9.4 10.8L13.6 14.3M23.1 12.1L18.6 14.5M22.7 21.6L18.4 17.8M11.2 22.3L14.3 18.2" stroke="${ACCENT}" stroke-width="1.15" stroke-linecap="round"/>
</svg>`;
}

function encodeIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const entries = [];
  const bodies = [];
  let offset = 6 + 16 * count;
  for (const { size, buffer } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    bodies.push(buffer);
    offset += buffer.length;
  }
  return Buffer.concat([header, ...entries, ...bodies]);
}

const OG_PAGES = [
  {
    file: "home",
    title: "Center for Digital Democracy",
    subtitle: "Advancing tech policy for better democratic outcomes.",
    badge: "HOME",
  },
  {
    file: "about",
    title: "About the Center",
    subtitle: "Independent research on platforms, data rights, civic AI, and elections.",
    badge: "ABOUT",
  },
  {
    file: "research",
    title: "Research program",
    subtitle: "Algorithmic accountability, election integrity, and civic AI.",
    badge: "RESEARCH",
  },
  {
    file: "initiatives",
    title: "Policy initiatives",
    subtitle: "Model rules, investigations, and civic partnerships.",
    badge: "INITIATIVES",
  },
  {
    file: "events",
    title: "Events calendar",
    subtitle: "Workshops, briefings, and public convenings.",
    badge: "EVENTS",
  },
  {
    file: "connect",
    title: "Connect",
    subtitle: "Contact the Center for Digital Democracy.",
    badge: "CONNECT",
  },
  {
    file: "observatory",
    title: "Subnational Election Observatory",
    subtitle: "Searchable subnational election research. Coverage is not complete.",
    badge: "OBSERVATORY",
  },
  {
    file: "observatory-about",
    title: "About the observatory",
    subtitle: "A public research product of the Center for Digital Democracy.",
    badge: "ABOUT",
  },
  {
    file: "regions",
    title: "Regions",
    subtitle: "Available, partial, screened-out, and not-yet-supplied coverage.",
    badge: "REGIONS",
  },
  {
    file: "explorer",
    title: "Election explorer",
    subtitle: "Filter offices by geography, tier, dates, evidence, and metrics.",
    badge: "EXPLORER",
  },
  {
    file: "calendar",
    title: "Election calendar",
    subtitle: "Upcoming dates, including partial and conditional labels.",
    badge: "CALENDAR",
  },
  {
    file: "compare",
    title: "Compare offices",
    subtitle: "Two to four offices, with incompatible comparisons explained.",
    badge: "COMPARE",
  },
  {
    file: "methodology",
    title: "Methodology",
    subtitle: "Formulas, eligibility, comparability, and status language.",
    badge: "METHODOLOGY",
  },
  {
    file: "polling",
    title: "Polling context",
    subtitle: "National and local polls as supplied in the imported release.",
    badge: "POLLING",
  },
  {
    file: "coverage",
    title: "Coverage and gaps",
    subtitle: "Completion queue, missing returns, and unresolved events.",
    badge: "COVERAGE",
  },
  {
    file: "sources",
    title: "Sources catalogue",
    subtitle: "Publisher, title, dates, and records supported.",
    badge: "SOURCES",
  },
  {
    file: "downloads",
    title: "Downloads",
    subtitle: "Workbooks, briefings, structured exports, and release artifacts.",
    badge: "DOWNLOADS",
  },
  {
    file: "releases",
    title: "Release history",
    subtitle: "Schema, methods, snapshot labels, and known gaps.",
    badge: "RELEASES",
  },
  {
    file: "country",
    title: "Country research",
    subtitle: "Template used for dynamic country pages in the observatory.",
    badge: "COUNTRY",
  },
  {
    file: "office",
    title: "Office briefing",
    subtitle: "Template used for dynamic office pages in the observatory.",
    badge: "OFFICE",
  },
  {
    file: "election",
    title: "Election record",
    subtitle: "Template used for dynamic election pages in the observatory.",
    badge: "ELECTION",
  },
];

const root = process.cwd();
const ogDir = path.join(root, "public/og");
mkdirSync(ogDir, { recursive: true });

for (const page of OG_PAGES) {
  const svg = ogSvg(page);
  const out = path.join(ogDir, `${page.file}.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log("wrote", path.relative(root, out));
}

await sharp(Buffer.from(markSvg(32)))
  .png()
  .toFile(path.join(root, "app/icon.png"));
await sharp(Buffer.from(markSvg(180)))
  .png()
  .toFile(path.join(root, "app/apple-icon.png"));

const icoPngs = [];
for (const size of [16, 32, 48]) {
  const buffer = await sharp(Buffer.from(markSvg(size))).png().toBuffer();
  icoPngs.push({ size, buffer });
}
writeFileSync(path.join(root, "app/favicon.ico"), encodeIco(icoPngs));
console.log("wrote app/icon.png, app/apple-icon.png, app/favicon.ico");

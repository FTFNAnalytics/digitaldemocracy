import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["app", "components", "lib"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md"]);
const pattern = /\[CONFIRM:[^\]]*\]/g;

function filesIn(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesIn(next);
    return extensions.has(path.extname(entry.name)) ? [next] : [];
  });
}

const hits = [];
for (const dir of scanRoots) {
  for (const file of filesIn(path.join(root, dir))) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      const matches = line.match(pattern);
      if (!matches) return;
      for (const match of matches) {
        hits.push(`${path.relative(root, file)}:${index + 1}: ${match}`);
      }
    });
  }
}

if (hits.length === 0) {
  console.log("No unconfirmed content placeholders.");
  process.exit(0);
}

const allowed = process.env.CONTENT_ALLOW_PLACEHOLDERS === "1";
const header = allowed
  ? `CONTENT_ALLOW_PLACEHOLDERS=1: ${hits.length} placeholder(s) remain visible:`
  : `${hits.length} unconfirmed content placeholder(s). Set CONTENT_ALLOW_PLACEHOLDERS=1 to build anyway:`;
console[allowed ? "log" : "error"](header);
for (const hit of hits) console[allowed ? "log" : "error"](hit);
process.exit(allowed ? 0 : 1);

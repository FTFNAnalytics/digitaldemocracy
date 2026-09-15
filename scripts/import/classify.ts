import { INPUT_MANIFEST, type InputDocumentType } from "../../schemas/v1/input-manifest";

export function classifyRelativePath(relativePath: string): {
  documentType: InputDocumentType;
  adapter: string;
} {
  const normalized = relativePath.replaceAll("\\", "/");
  const specific = INPUT_MANIFEST.filter((entry) => entry.documentType !== "unknown");
  for (const entry of specific) {
    if (entry.glob.some((pattern) => globMatch(pattern, normalized))) {
      return { documentType: entry.documentType, adapter: entry.adapter };
    }
  }
  return { documentType: "unknown", adapter: "unknown" };
}

export function globMatch(pattern: string, value: string): boolean {
  let i = 0;
  let regex = "^";
  while (i < pattern.length) {
    if (pattern.startsWith("**/", i)) {
      regex += "(?:.*/)?";
      i += 3;
    } else if (pattern.startsWith("**", i)) {
      regex += ".*";
      i += 2;
    } else if (pattern[i] === "*") {
      regex += "[^/]*";
      i += 1;
    } else if (pattern[i] === "{") {
      const end = pattern.indexOf("}", i);
      const options = pattern
        .slice(i + 1, end)
        .split(",")
        .map(escapeRegex);
      regex += `(?:${options.join("|")})`;
      i = end + 1;
    } else {
      regex += escapeRegex(pattern[i]!);
      i += 1;
    }
  }
  regex += "$";
  return new RegExp(regex, "i").test(value);
}

function escapeRegex(value: string): string {
  return value.replace(/[.+^${}()|[\]\\]/g, "\\$&");
}

export function adapterStatus(adapter: string): "ready" | "stub" {
  return ["country-json", "country-screen", "polling-context", "completion-queue-csv", "briefing-html"].includes(adapter) ? "ready" : "stub";
}

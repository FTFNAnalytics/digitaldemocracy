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

function globMatch(pattern: string, value: string): boolean {
  const regex = new RegExp(
    `^${pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, ":::GLOBSTAR:::")
      .replace(/\*/g, "[^/]*")
      .replace(/:::GLOBSTAR:::/g, ".*")}$`,
    "i",
  );
  return regex.test(value);
}

export function adapterStatus(adapter: string): "ready" | "stub" {
  return adapter === "unknown" ? "stub" : "stub";
}

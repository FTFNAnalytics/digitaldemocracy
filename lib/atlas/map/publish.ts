import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { boundaryAttribution, topojsonUrlForParent } from "./model";

/** Null when OV-07 has not written an approved children file for this parent. */
export function publishedChildrenTopojsonUrl(
  parentKey: string,
  publicDir = path.join(process.cwd(), "public"),
): string | null {
  let url: string;
  try {
    url = topojsonUrlForParent(parentKey);
  } catch {
    return null;
  }
  const relative = url.replace(/^\//, "");
  if (!existsSync(path.join(publicDir, relative))) return null;
  return url;
}

/** Attribution for an approved crosswalk. A missing or unapproved file contributes nothing. */
export function attributionForCountry(
  countryId: string,
  root = process.cwd(),
): string | null {
  const filePath = path.join(root, "schemas", "atlas", "boundaries", `${countryId}.json`);
  if (!existsSync(filePath)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as { review_status?: unknown; boundary_source?: unknown };
  if (record.review_status !== "approved") return null;
  return boundaryAttribution(typeof record.boundary_source === "string" ? record.boundary_source : null);
}

import { readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { getDataset } from "@/lib/observatory/load";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ artifactId: string }> },
) {
  const { artifactId } = await params;
  if (artifactId === "manifest")
    return new Response(
      readFileSync(path.join(process.cwd(), "data/research/manifest.json")),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="release-manifest.json"',
        },
      },
    );
  const artifact = getDataset().artifacts.find((a) => a.id === artifactId);
  if (!artifact) return new Response("Unknown artifact", { status: 404 });
  if (!artifact.available) {
    const base = process.env.ELECTION_ARTIFACT_BASE_URL;
    if (!base || !artifact.originalPath)
      return new Response("Original binary artifact host is not configured.", {
        status: 404,
      });
    const url = new URL(
      artifact.originalPath.split("/").map(encodeURIComponent).join("/"),
      base.endsWith("/") ? base : base + "/",
    );
    if (url.protocol !== "https:")
      return new Response("Artifact host must use HTTPS", { status: 503 });
    return Response.redirect(url, 302);
  }
  if (!artifact.checksum || !/^[a-f0-9]{64}$/.test(artifact.checksum))
    return new Response("Invalid artifact checksum", { status: 500 });
  const bytes = gunzipSync(
    readFileSync(
      path.join(
        process.cwd(),
        "data/research/objects",
        artifact.checksum + ".gz",
      ),
    ),
  );
  if (createHash("sha256").update(bytes).digest("hex") !== artifact.checksum)
    return new Response("Artifact checksum mismatch", { status: 500 });
  const filename = path
    .basename(artifact.originalPath || artifact.id)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
      "Cache-Control": "public, max-age=0, must-revalidate",
      ETag: `"${artifact.checksum}"`,
    },
  });
}

import { serveAtlasExport } from "@/lib/atlas/api/serve";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ path?: string[] }> };

export function GET(request: Request, { params }: Props): Promise<Response> {
  return params.then(({ path }) => serveAtlasExport(request, "jurisdictions", path ?? []));
}

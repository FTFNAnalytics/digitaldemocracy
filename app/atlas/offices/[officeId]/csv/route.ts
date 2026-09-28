import { lookupAtlasOffice } from "@/lib/atlas/read";
import { historyCsv } from "@/lib/atlas/seat/history";
import { readSeatPage } from "@/lib/atlas/seat/read";

type Props = {
  params: Promise<{ officeId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { officeId: rawId } = await params;
  const officeId = decodeURIComponent(rawId);
  const lookup = lookupAtlasOffice(officeId);
  if (lookup.status === "missing") {
    return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (lookup.status === "ambiguous") {
    return new Response("More than one record matches\n", {
      status: 409,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const model = readSeatPage(lookup.record.idNamespace, lookup.record.officeId);
  if (!model) {
    return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const safeName = lookup.record.officeId.replace(/[^A-Za-z0-9._-]+/g, "_");
  return new Response(historyCsv(model.history), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.csv"`,
    },
  });
}

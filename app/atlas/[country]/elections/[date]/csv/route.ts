import { cycleCsv } from "@/lib/atlas/cycle/csv";
import { loadCyclePage } from "@/lib/atlas/cycle/read";

type Props = {
  params: Promise<{ country: string; date: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { country, date } = await params;
  const loaded = loadCyclePage({ country: decodeURIComponent(country), dateToken: decodeURIComponent(date) });
  if (loaded.status !== "ready" || loaded.model.kind !== "day") {
    return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const safeName = `${country}-${date}`.replace(/[^A-Za-z0-9._-]+/g, "_");
  return new Response(cycleCsv(loaded.model.contests), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.csv"`,
    },
  });
}

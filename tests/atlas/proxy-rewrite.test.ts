import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "../../proxy";

const SEAT = "/atlas/albania/berat/seats/berat-keshilli-bashkiak";
const SEAT_ALIAS = "/atlas/seat-alias/albania/berat/berat-keshilli-bashkiak";

function rewriteUrl(response: Response): URL {
  const raw = response.headers.get("x-middleware-rewrite");
  expect(raw).toBeTruthy();
  return new URL(raw ?? "");
}

describe("atlas proxy internal rewrites", () => {
  it("rewrites a pretty seat URL to HTTP on loopback when nginx forwarded HTTPS", () => {
    const forwarded = { headers: { "x-forwarded-proto": "https" } };
    for (const origin of ["https://127.0.0.1:3000", "https://localhost:3000"]) {
      const rewritten = rewriteUrl(proxy(new NextRequest(`${origin}${SEAT}`, forwarded)));
      expect(rewritten.protocol).toBe("http:");
      expect(rewritten.hostname).toBe("localhost");
      expect(rewritten.port).toBe("3000");
      expect(rewritten.pathname).toBe(SEAT_ALIAS);
      expect(rewritten.href.startsWith("https://localhost")).toBe(false);
    }
  });

  it("treats a forwarded proto chain as HTTPS for the loopback hop", () => {
    const rewritten = rewriteUrl(
      proxy(
        new NextRequest(`https://localhost:3000${SEAT}?cycle=2023`, {
          headers: { "x-forwarded-proto": "https, http" },
        }),
      ),
    );
    expect(rewritten.protocol).toBe("http:");
    expect(rewritten.pathname).toBe(SEAT_ALIAS);
    expect(rewritten.search).toBe("?cycle=2023");
  });

  it("keeps local HTTP rewrites on HTTP", () => {
    for (const origin of ["http://127.0.0.1:3000", "http://localhost:3000"]) {
      const rewritten = rewriteUrl(proxy(new NextRequest(`${origin}${SEAT}`)));
      expect(rewritten.protocol).toBe("http:");
      expect(rewritten.hostname).toBe("localhost");
      expect(rewritten.pathname).toBe(SEAT_ALIAS);
    }
  });

  it("keeps a direct HTTPS loopback rewrite on HTTPS when nothing forwarded the proto", () => {
    const rewritten = rewriteUrl(proxy(new NextRequest(`https://localhost:3000${SEAT}`)));
    expect(rewritten.protocol).toBe("https:");
    expect(rewritten.hostname).toBe("localhost");
    expect(rewritten.pathname).toBe(SEAT_ALIAS);
  });

  it("does not retarget a non-loopback HTTPS origin", () => {
    const rewritten = rewriteUrl(
      proxy(
        new NextRequest(`https://center4digitaldemocracy.com${SEAT}`, {
          headers: { "x-forwarded-proto": "https" },
        }),
      ),
    );
    expect(rewritten.protocol).toBe("https:");
    expect(rewritten.hostname).toBe("center4digitaldemocracy.com");
    expect(rewritten.pathname).toBe(SEAT_ALIAS);
  });

  it("uses the same loopback scheme for the other internal atlas rewrites", () => {
    const headers = { "x-forwarded-proto": "https" };
    const office = rewriteUrl(
      proxy(new NextRequest("https://127.0.0.1:3000/atlas/offices/AL-05-M.csv", { headers })),
    );
    expect(office.protocol).toBe("http:");
    expect(office.pathname).toBe("/atlas/offices/AL-05-M/csv");
    const cycle = rewriteUrl(
      proxy(new NextRequest("https://localhost:3000/atlas/albania/elections/2023-05-14.csv", { headers })),
    );
    expect(cycle.protocol).toBe("http:");
    expect(cycle.pathname).toBe("/atlas/albania/elections/2023-05-14/csv");
    const kit = rewriteUrl(proxy(new NextRequest("https://localhost:3000/atlas/_kit", { headers })));
    expect(kit.protocol).toBe("http:");
    expect(kit.pathname).toBe("/atlas/reading-kit");
  });
});

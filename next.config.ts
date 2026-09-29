import type { NextConfig } from "next";
import { atlasGeoCacheHeaders } from "./lib/atlas/map/headers";

const nextConfig: NextConfig = {
  agentRules: false,
  output: "standalone",
  experimental: { cpus: 2 },
  outputFileTracingIncludes: {
    "/electiondatabase/**/*": ["./data/research/**/*", "./data/countries/**/*"],
    "/atlas/**/*": [
      "./docs/phase1/uruguay/data/upcoming-calendar.jsonl",
      "./docs/phase1/georgia/data/upcoming-calendar.jsonl",
    ],
  },
  async headers() {
    return atlasGeoCacheHeaders();
  },
};

export default nextConfig;

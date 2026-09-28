import type { NextConfig } from "next";
import { atlasGeoCacheHeaders } from "./lib/atlas/map/headers";

const nextConfig: NextConfig = {
  agentRules: false,
  output: "standalone",
  experimental: { cpus: 2 },
  outputFileTracingIncludes: {
    "/electiondatabase/**/*": ["./data/research/**/*", "./data/countries/**/*"],
  },
  async headers() {
    return atlasGeoCacheHeaders();
  },
};

export default nextConfig;

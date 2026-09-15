import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  output: "standalone",
  experimental: { cpus: 2 },
  outputFileTracingIncludes: {
    "/electiondatabase/**/*": ["./data/research/**/*", "./data/countries/**/*"],
  },
};

export default nextConfig;

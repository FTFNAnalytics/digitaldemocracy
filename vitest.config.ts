import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    env: { OBSERVATORY_FIXTURES: "1" },
    include: ["tests/**/*.test.ts"],
    testTimeout: 600_000,
    hookTimeout: 600_000,
    teardownTimeout: 600_000,
    maxWorkers: 1,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

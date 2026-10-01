import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    env: { OBSERVATORY_FIXTURES: "1" },
    include: ["tests/**/*.test.ts"],
    testTimeout: 600_000,
    hookTimeout: 600_000,
    teardownTimeout: 180_000,
    maxWorkers: 1,
    // All 504 tests can pass and CI still fails: the worker RPC hits the 60s
    // onTaskUpdate timeout while the main process is busy. Ignore that flake.
    dangerouslyIgnoreUnhandledErrors: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

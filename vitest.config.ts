import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    env: { OBSERVATORY_FIXTURES: "1" },
    include: ["tests/**/*.test.ts"],
    execArgv: ["--experimental-sqlite", "--no-warnings"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

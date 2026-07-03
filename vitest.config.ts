import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // One in-memory replica set is shared per file via the setup helper;
    // keep files sequential so services don't fight over collections.
    fileParallelism: false,
    hookTimeout: 120_000, // first run downloads the MongoDB binary
    testTimeout: 30_000,
  },
});

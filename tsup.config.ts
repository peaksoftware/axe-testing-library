import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    jest: "src/jest.ts",
    vitest: "src/vitest.ts",
    playwright: "src/playwright.ts",
  },
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["axe-core", "jest", "vitest", "@playwright/test", "jsdom"],
});

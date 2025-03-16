import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["**/__tests__/vitest/**/*.(test|spec).[jt]s?(x)"],
    setupFiles: ["vitest.setup.ts"],
  },
});

import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    include: ["packages/*/test/**/*.test.{ts,tsx}", "scripts/test/**/*.test.{ts,tsx}"],
  },
});

import { defineConfig } from "vitest/config"
import viteSolid from "vite-plugin-solid"

export default defineConfig({
  plugins: [viteSolid()],
  test: {
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/*.spec.ts",
      "src/**/*.spec.tsx",
    ],
  },
})

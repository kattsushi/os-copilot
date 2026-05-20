import { defineConfig } from "vite"
import viteSolid from "vite-plugin-solid"

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "solid-js/store"],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [viteSolid()],
})

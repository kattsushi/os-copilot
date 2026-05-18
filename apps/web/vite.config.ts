import { tanstackStart } from "@tanstack/solid-start/plugin/vite"
import { defineConfig } from "vite"
import viteSolid from "vite-plugin-solid"

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    {
      name: "alchemy-solid-start-ssr-resolve",
      configResolved(config) {
        for (const environment of Object.values(config.environments)) {
          environment.resolve.external = []
        }
      },
    },
    tanstackStart(),
    viteSolid({ ssr: true }),
  ],
})

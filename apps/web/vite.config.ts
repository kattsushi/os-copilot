import { tanstackStart } from "@tanstack/solid-start/plugin/vite"
import { defineConfig, type ResolvedConfig } from "vite"
import viteSolid from "vite-plugin-solid"

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
  },
  server: {
    port: 3000,
    headers: {
      // Required for SQLite WASM + OPFS performance (SharedArrayBuffer)
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    {
      name: "alchemy-solid-start-ssr-resolve",
      configResolved(config: ResolvedConfig) {
        for (const environment of Object.values(config.environments)) {
          if (typeof environment === "object" && environment) {
            ;(
              environment as unknown as {
                resolve: {
                  external: Array<unknown>
                }
              }
            ).resolve.external = []
          }
        }
      },
    },
    tanstackStart(),
    viteSolid({ ssr: true }),
  ],
})

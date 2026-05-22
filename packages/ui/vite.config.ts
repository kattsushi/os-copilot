import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import viteSolid from "vite-plugin-solid"

const externalPackages = [
  "@fontsource-variable/inter",
  "@kobalte/core",
  "@tanstack/solid-table",
  "class-variance-authority",
  "clsx",
  "echarts",
  "lucide-solid",
  "solid-js",
  "solid-sonner",
  "tailwind-merge",
  "tailwindcss",
]

function isExternalPackage(id: string): boolean {
  return externalPackages.some(
    (dependency) => id === dependency || id.startsWith(`${dependency}/`)
  )
}

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: isExternalPackage,
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), viteSolid()],
})

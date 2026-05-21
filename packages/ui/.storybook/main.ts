import tailwindcss from "@tailwindcss/vite"
import type { StorybookConfig } from "storybook-solidjs-vite"
import { mergeConfig } from "vite"

const config: StorybookConfig = {
  stories: ["../src/stories/ui/**/*.stories.@(ts|tsx|mdx)"],
  addons: [],
  framework: {
    name: "storybook-solidjs-vite",
    options: {},
  },
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      resolve: {
        tsconfigPaths: true,
      },
    }),
}

export default config

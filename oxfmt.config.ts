import { defineConfig } from "oxfmt"
import ultracite from "ultracite/oxfmt"

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),

    // Nx AI-agent config artifacts (only keep .agents standards in repo)
    "**/.agents/**",
  ],

  // Match prior dprint intent
  printWidth: 80,
  semi: false,
  singleQuote: false,
  trailingComma: "es5",

  // dprint had JSON trailingCommas = never
  overrides: [
    // Keep VSCode recommendation lists readable (avoid single-line arrays)
    {
      files: [".vscode/extensions.json"],
      options: {
        printWidth: 1,
      },
    },
    {
      files: ["*.json", "*.jsonc"],
      options: {
        trailingComma: "none",
      },
    },
  ],
})

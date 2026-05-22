import * as Alchemy from "alchemy"
import * as Cloudflare from "alchemy/Cloudflare"
import { Stage } from "alchemy/Stage"
import * as Effect from "effect/Effect"
import type * as Layer from "effect/Layer"

type CloudflareProviderLayer = Layer.Layer<
  Cloudflare.ProviderRequirements,
  never,
  never
>

const cloudflareProviders =
  Cloudflare.providers as () => CloudflareProviderLayer

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const AuthDb = Cloudflare.D1Database("AuthDb", {
  migrationsDir: "./migrations/auth",
})

export const Website = Cloudflare.Vite("Website", {
  compatibility: {
    flags: ["nodejs_compat"],
  },
  bindings: {
    AUTH_DB: AuthDb,
  },
  env: {
    BETTER_AUTH_SECRET: requiredEnv("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "",
  },
})

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>

export default Alchemy.Stack(
  "OsCopilotWeb",
  {
    providers: cloudflareProviders(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const website = yield* Website

    return {
      stage: yield* Stage,
      url: website.url.as<string>(),
      domains: website.domains,
    }
  })
)

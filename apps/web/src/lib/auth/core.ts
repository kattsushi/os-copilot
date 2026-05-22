import type { WebsiteEnv } from "../../../alchemy.run"

type D1Binding = Pick<WebsiteEnv["AUTH_DB"], "prepare">

export type AuthEnv = {
  AUTH_DB?: D1Binding
  BETTER_AUTH_SECRET?: string
  BETTER_AUTH_URL?: string
}

export const dynamicAuthBaseURL: {
  allowedHosts: Array<string>
  protocol: "http" | "https" | "auto"
  fallback: string
} = {
  allowedHosts: [
    "website.localhost:1337",
    "localhost:*",
    "127.0.0.1:*",
    "*.workers.dev",
  ],
  protocol: "https",
  fallback: "http://website.localhost:1337",
}

export type SessionCapableAuth<TSession = unknown> = {
  api: {
    getSession: (input: { headers: Headers }) => Promise<TSession | null>
  }
}

export function resolveAuthConfig(env: AuthEnv) {
  if (!env.AUTH_DB || typeof env.AUTH_DB.prepare !== "function") {
    throw new Error(
      "Missing Cloudflare D1 binding AUTH_DB. Check Alchemy bindings for Website."
    )
  }

  if (!env.BETTER_AUTH_SECRET) {
    throw new Error(
      "Missing BETTER_AUTH_SECRET. Add it to apps/web/.env or deployed worker env."
    )
  }

  if (env.BETTER_AUTH_URL && !URL.canParse(env.BETTER_AUTH_URL)) {
    throw new Error("BETTER_AUTH_URL must be a valid absolute URL.")
  }

  return {
    AUTH_DB: env.AUTH_DB,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL || undefined,
  }
}

export async function getSessionFromHeaders<TSession>(
  auth: SessionCapableAuth<TSession>,
  headers: Headers
) {
  return (await auth.api.getSession({ headers })) ?? null
}

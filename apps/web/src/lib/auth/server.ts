import type { D1Database } from "@cloudflare/workers-types"
import { getRequestHeaders } from "@tanstack/solid-start/server"
import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start/solid"
import * as cf from "cloudflare:workers"

import {
  type AuthEnv,
  dynamicAuthBaseURL,
  getSessionFromHeaders,
  resolveAuthConfig,
} from "./core"

const authEnv = new Proxy({} as AuthEnv, {
  get(_, prop) {
    return cf.env[prop as keyof typeof cf.env]
  },
})

let authSingleton: ReturnType<typeof createAuth> | undefined

function createAuth(env: AuthEnv) {
  const resolved = resolveAuthConfig(env)

  const baseURL = resolved.BETTER_AUTH_URL ?? dynamicAuthBaseURL

  return betterAuth({
    // Better Auth 1.6.11 supports D1Database directly, so we keep the MVP on
    // the native D1 path and avoid better-auth-cloudflare / Drizzle.
    database: resolved.AUTH_DB as D1Database,
    secret: resolved.BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins: resolved.BETTER_AUTH_URL ? [resolved.BETTER_AUTH_URL] : [],
    emailAndPassword: {
      enabled: true,
    },
    plugins: [tanstackStartCookies()],
  })
}

export function getAuth(env: AuthEnv = authEnv) {
  if (!authSingleton || env !== authEnv) {
    const instance = createAuth(env)
    if (env === authEnv) {
      authSingleton = instance
    }
    return instance
  }

  return authSingleton
}

export async function getServerSession() {
  return getSessionFromHeaders(getAuth(), getRequestHeaders())
}

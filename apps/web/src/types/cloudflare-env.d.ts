import type { D1Database } from "@cloudflare/workers-types"

declare module "cloudflare:workers" {
  export const env: {
    AUTH_DB: D1Database
    BETTER_AUTH_SECRET?: string
    BETTER_AUTH_URL?: string
  }
}

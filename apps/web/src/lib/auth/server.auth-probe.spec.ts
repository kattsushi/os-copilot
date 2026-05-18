import { describe, expect, it } from "vitest"
import { type AuthEnv, getSessionFromHeaders, resolveAuthConfig } from "./core"

describe("resolveAuthConfig", () => {
  const baseEnv: AuthEnv = {
    AUTH_DB: { prepare: () => ({}) } as unknown as AuthEnv["AUTH_DB"],
    BETTER_AUTH_SECRET: "super-secret-value",
    BETTER_AUTH_URL: "http://localhost:3000",
  }

  it("throws when BETTER_AUTH_SECRET is missing", () => {
    expect(() =>
      resolveAuthConfig({
        ...baseEnv,
        BETTER_AUTH_SECRET: "",
      })
    ).toThrow(/BETTER_AUTH_SECRET/)
  })

  it("allows BETTER_AUTH_URL to be omitted for dynamic preview origins", () => {
    expect(
      resolveAuthConfig({
        ...baseEnv,
        BETTER_AUTH_URL: "",
      }).BETTER_AUTH_URL,
    ).toBeUndefined()
  })

  it("throws when BETTER_AUTH_URL is invalid", () => {
    expect(() =>
      resolveAuthConfig({
        ...baseEnv,
        BETTER_AUTH_URL: "not a url",
      })
    ).toThrow(/valid absolute URL/)
  })
})

describe("getSessionFromHeaders", () => {
  it("returns null when no session cookie is present", async () => {
    const auth = {
      api: {
        getSession: async () => null,
      },
    }

    await expect(
      getSessionFromHeaders(auth, new Headers()),
    ).resolves.toBeNull()
  })

  it("returns the session payload when auth resolves a session", async () => {
    const session = {
      session: { id: "session_123" },
      user: { id: "user_123", email: "user@example.com" },
    }
    const auth = {
      api: {
        getSession: async () => session,
      },
    }

    await expect(
      getSessionFromHeaders(auth, new Headers([["cookie", "auth=1"]])),
    ).resolves.toEqual(session)
  })
})

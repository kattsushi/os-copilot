import { describe, expect, it, vi } from "vitest"
import { buildAuthRouteHandlers } from "./route-handlers"

describe("buildAuthRouteHandlers", () => {
  it("exposes GET and POST handlers", () => {
    const handlers = buildAuthRouteHandlers({
      handler: vi.fn(async () => new Response(null, { status: 204 })),
    })

    expect(handlers.GET).toBeTypeOf("function")
    expect(handlers.POST).toBeTypeOf("function")
  })

  it("dispatches GET requests to Better Auth", async () => {
    const handler = vi.fn(
      async (request: Request) => new Response(request.method, { status: 200 }),
    )
    const handlers = buildAuthRouteHandlers({ handler })
    const request = new Request("http://localhost:3000/api/auth/session", {
      method: "GET",
    })

    const response = await handlers.GET({ request })

    expect(handler).toHaveBeenCalledWith(request)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("GET")
  })

  it("dispatches POST requests to Better Auth", async () => {
    const handler = vi.fn(
      async (request: Request) => new Response(request.method, { status: 201 }),
    )
    const handlers = buildAuthRouteHandlers({ handler })
    const request = new Request(
      "http://localhost:3000/api/auth/sign-in/email",
      {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com" }),
        headers: { "content-type": "application/json" },
      },
    )

    const response = await handlers.POST({ request })

    expect(handler).toHaveBeenCalledWith(request)
    expect(response.status).toBe(201)
    expect(await response.text()).toBe("POST")
  })
})

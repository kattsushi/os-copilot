import { createFileRoute } from "@tanstack/solid-router"
import { buildAuthRouteHandlers } from "../../../lib/auth/route-handlers"
import { getAuth } from "../../../lib/auth/server"

export const authRouteHandlers = buildAuthRouteHandlers({
  handler: (request) => getAuth().handler(request),
})

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: authRouteHandlers,
  },
})

export type AuthRouteContext = {
  request: Request
}

export type AuthRequestHandler = {
  handler: (request: Request) => Promise<Response> | Response
}

export function buildAuthRouteHandlers(auth: AuthRequestHandler) {
  const handle = ({ request }: AuthRouteContext) => auth.handler(request)

  return {
    GET: handle,
    POST: handle,
    PATCH: handle,
    PUT: handle,
    DELETE: handle,
  }
}

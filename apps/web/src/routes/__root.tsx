/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/solid-router"
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools"
import * as Solid from "solid-js"
import { HydrationScript } from "solid-js/web"
import appCss from "../styles/app.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "os-copilot" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument(props: Readonly<{ children: Solid.JSX.Element }>) {
  return (
    <html lang="en">
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        <nav class="app-nav" aria-label="Primary">
          <Link to="/" activeProps={{ class: "active" }}>
            Home
          </Link>
          <a href="/account">Account</a>
          <Link to="/login" activeProps={{ class: "active" }}>
            Login
          </Link>
          <a href="/register">Register</a>
        </nav>
        <main>
          <Solid.Suspense>{props.children}</Solid.Suspense>
        </main>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}

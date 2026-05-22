import { createFileRoute } from "@tanstack/solid-router"
import { createServerFn } from "@tanstack/solid-start"

import { SessionPanel } from "../components/SessionPanel"
import { getSession } from "../lib/auth/session"

const getSsrProbe = createServerFn({ method: "GET" }).handler(() => ({
  message: "SSR server function executed by TanStack Start Solid",
}))

export const Route = createFileRoute("/")({
  loader: async () => ({
    session: await getSession(),
    ssrProbe: await getSsrProbe(),
  }),
  component: HomePage,
})

function HomePage() {
  const data = Route.useLoaderData()

  return (
    <section class="hero">
      <p class="eyebrow">os-copilot</p>
      <h1>Architecture-aware operating system copilot</h1>
      <p>
        Clone reference repositories into <code>repos/</code>, then use the repo
        architecture explorer skill to extract reusable product and code
        patterns.
      </p>
      <p>
        <strong>SSR probe:</strong> {data().ssrProbe.message}
      </p>
      <SessionPanel session={data().session} />
    </section>
  )
}

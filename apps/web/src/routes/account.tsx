import { createFileRoute, redirect } from "@tanstack/solid-router"

import { SessionPanel } from "../components/SessionPanel"
import { getSession } from "../lib/auth/session"

export const Route = createFileRoute("/account")({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session?.user) {
      throw redirect({ to: "/login" })
    }
    return { session }
  },
  component: AccountPage,
})

function AccountPage() {
  const context = Route.useRouteContext()

  return (
    <section class="hero">
      <p class="eyebrow">Account</p>
      <h1>Your remote auth identity</h1>
      <SessionPanel session={context().session} />
    </section>
  )
}

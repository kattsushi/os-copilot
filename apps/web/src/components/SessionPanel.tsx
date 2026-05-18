import { createSignal, Show } from "solid-js"
import { authClient } from "../lib/auth/client"

type Session = {
  user?: {
    email?: string | null
    name?: string | null
  } | null
} | null

export function SessionPanel(props: Readonly<{ session: Session }>) {
  const [isSigningOut, setIsSigningOut] = createSignal(false)

  async function signOut() {
    setIsSigningOut(true)
    await authClient.signOut()
    window.location.assign("/")
  }

  return (
    <div class="session-panel">
      <Show
        when={props.session?.user}
        fallback={
          <div>
            <p>No active session.</p>
            <div class="actions">
              <a class="button" href="/login">
                Login
              </a>
              <a class="button secondary" href="/register">
                Register
              </a>
            </div>
          </div>
        }
      >
        {(user) => (
          <div>
            <p>
              Signed in as <strong>{user().email ?? user().name}</strong>
            </p>
            <div class="actions">
              <a class="button secondary" href="/account">
                Account
              </a>
              <button disabled={isSigningOut()} type="button" onClick={signOut}>
                {isSigningOut() ? "Signing out…" : "Logout"}
              </button>
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}

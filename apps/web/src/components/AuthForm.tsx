import { createSignal, Show } from "solid-js"

import { authClient } from "../lib/auth/client"

type AuthMode = "login" | "register"

export function AuthForm(props: Readonly<{ mode: AuthMode }>) {
  const [name, setName] = createSignal("")
  const [email, setEmail] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [error, setError] = createSignal<string | undefined>()
  const [isSubmitting, setIsSubmitting] = createSignal(false)

  const isRegister = () => props.mode === "register"

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(undefined)
    setIsSubmitting(true)

    const payload = {
      email: email(),
      password: password(),
    }

    const result = isRegister()
      ? await authClient.signUp.email({
          ...payload,
          name: name() || email(),
          callbackURL: "/account",
        })
      : await authClient.signIn.email({
          ...payload,
          callbackURL: "/account",
        })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error.message ?? "Authentication failed")
      return
    }

    window.location.assign("/account")
  }

  return (
    <section class="auth-card">
      <p class="eyebrow">{isRegister() ? "Create account" : "Welcome back"}</p>
      <h1>{isRegister() ? "Register" : "Login"}</h1>
      <form class="auth-form" onSubmit={handleSubmit}>
        <Show when={isRegister()}>
          <label>
            Name
            <input
              value={name()}
              onInput={(event) => setName(event.currentTarget.value)}
              autocomplete="name"
            />
          </label>
        </Show>
        <label>
          Email
          <input
            value={email()}
            onInput={(event) => setEmail(event.currentTarget.value)}
            autocomplete="email"
            required
            type="email"
          />
        </label>
        <label>
          Password
          <input
            value={password()}
            onInput={(event) => setPassword(event.currentTarget.value)}
            autocomplete={isRegister() ? "new-password" : "current-password"}
            minlength="8"
            required
            type="password"
          />
        </label>
        <Show when={error()}>
          {(message) => (
            <p class="form-error" role="alert">
              {message()}
            </p>
          )}
        </Show>
        <button disabled={isSubmitting()} type="submit">
          {isSubmitting()
            ? "Working…"
            : isRegister()
              ? "Create account"
              : "Login"}
        </button>
      </form>
      <p class="auth-switch">
        {isRegister() ? "Already have an account?" : "Need an account?"}
        {"  "}
        <a href={isRegister() ? "/login" : "/register"}>
          {isRegister() ? "Login" : "Register"}
        </a>
      </p>
    </section>
  )
}

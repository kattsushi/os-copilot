import { createFileRoute } from "@tanstack/solid-router"
import { AuthForm } from "../components/AuthForm"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  return <AuthForm mode="register" />
}

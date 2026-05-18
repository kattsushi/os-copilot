import { createServerFn } from "@tanstack/solid-start"
import { getServerSession } from "./server"

export const getSession = createServerFn({ method: "GET" }).handler(() => getServerSession())

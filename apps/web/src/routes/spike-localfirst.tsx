import { createFileRoute } from "@tanstack/solid-router"
import { createSignal, onCleanup } from "solid-js"

import type { WorkerMessage } from "../spikes/localfirst/worker"

export const Route = createFileRoute("/spike-localfirst")({
  component: SpikeLocalFirstPage,
})

function SpikeLocalFirstPage() {
  const [status, setStatus] = createSignal<
    "idle" | "starting" | "ready" | "error"
  >("idle")
  const [lastMessage, setLastMessage] = createSignal<string>("")

  let worker: Worker | undefined

  const stop = () => {
    worker?.terminate()
    worker = undefined
    setStatus("idle")
  }

  onCleanup(() => {
    stop()
  })

  const start = () => {
    stop()

    setStatus("starting")

    try {
      worker = new Worker(
        new URL("../spikes/localfirst/worker.ts", import.meta.url),
        {
          type: "module",
        }
      )

      worker.addEventListener(
        "message",
        (event: MessageEvent<WorkerMessage>) => {
          const msg = event.data
          setLastMessage(JSON.stringify(msg))

          if (msg?.type === "ready") {
            setStatus("ready")
            return
          }

          if (msg?.type === "pong") {
            // no-op; lastMessage already updated
          }
        }
      )

      worker.addEventListener("error", (event) => {
        setStatus("error")
        setLastMessage(event.message)
      })
    } catch (error) {
      setStatus("error")
      setLastMessage(error instanceof Error ? error.message : String(error))
    }
  }

  const ping = () => {
    worker?.postMessage({ type: "ping" } as const)
  }

  return (
    <section>
      <h1>Spike: Local-first Worker</h1>
      <p>
        This route is a temporary spike to validate Web Worker bundling in the
        TanStack Start + Vite setup.
      </p>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={start}
          disabled={status() === "starting"}
        >
          Start worker
        </button>
        <button type="button" onClick={ping} disabled={status() !== "ready"}>
          Ping
        </button>
        <button type="button" onClick={stop} disabled={status() === "idle"}>
          Stop
        </button>
      </div>

      <dl>
        <dt>Status</dt>
        <dd>{status()}</dd>
        <dt>Last message</dt>
        <dd>
          <pre>{lastMessage()}</pre>
        </dd>
      </dl>
    </section>
  )
}

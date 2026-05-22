import { createFileRoute } from "@tanstack/solid-router"
import { createSignal, onCleanup } from "solid-js"

import { loadMigrations } from "../spikes/localfirst/migrations/loader.spike"
import type { WorkerMessage } from "../spikes/localfirst/worker"

type SqliteWorkerReady = ["ready", undefined, undefined]
// [id, errorMessage | undefined, result]
type SqliteWorkerResponse = [number, string | undefined, unknown]

type SqliteWorkerFatal = {
  readonly type: "fatal"
  readonly message: string
}

type SqliteWorkerMessage =
  | SqliteWorkerReady
  | SqliteWorkerResponse
  | SqliteWorkerFatal

export const Route = createFileRoute("/spike-localfirst")({
  component: SpikeLocalFirstPage,
})

function SpikeLocalFirstPage() {
  const [status, setStatus] = createSignal<
    "idle" | "starting" | "ready" | "error"
  >("idle")
  const [lastMessage, setLastMessage] = createSignal<string>("")

  const [sqliteStatus, setSqliteStatus] = createSignal<
    "idle" | "starting" | "ready" | "error"
  >("idle")
  const [sqliteLastMessage, setSqliteLastMessage] = createSignal<string>("")
  const [sqliteSelect1, setSqliteSelect1] = createSignal<string>("")

  const [migrationList, setMigrationList] = createSignal<string>("")

  let worker: Worker | undefined
  let sqliteWorker: Worker | undefined

  const stop = () => {
    worker?.terminate()
    worker = undefined
    setStatus("idle")
  }

  const stopSqlite = () => {
    sqliteWorker?.terminate()
    sqliteWorker = undefined
    setSqliteStatus("idle")
  }

  onCleanup(() => {
    stop()
    stopSqlite()
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

  const startSqlite = () => {
    stopSqlite()
    setSqliteStatus("starting")
    setSqliteSelect1("")

    try {
      sqliteWorker = new Worker(
        new URL("../spikes/localfirst/sqlite-opfs-worker.ts", import.meta.url),
        {
          type: "module",
        }
      )

      sqliteWorker.addEventListener(
        "message",
        (event: MessageEvent<SqliteWorkerMessage>) => {
          const msg = event.data
          setSqliteLastMessage(JSON.stringify(msg))

          if (Array.isArray(msg) && msg[0] === "ready") {
            setSqliteStatus("ready")
            return
          }

          if (Array.isArray(msg) && typeof msg[0] === "number") {
            // handled by request map
            return
          }

          if (!Array.isArray(msg) && msg?.type === "fatal") {
            setSqliteStatus("error")
          }
        }
      )

      sqliteWorker.addEventListener("error", (event) => {
        setSqliteStatus("error")
        setSqliteLastMessage(event.message)
      })
    } catch (error) {
      setSqliteStatus("error")
      setSqliteLastMessage(
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  let requestId = 0

  const sqliteRequest = (sql: string, params: unknown = []) => {
    const w = sqliteWorker
    if (!w) {
      return Promise.reject(new Error("SQLite worker not started"))
    }

    requestId += 1
    const id = requestId

    // Spike-only: we want the simplest request/response wiring.
    // oxlint-disable-next-line promise/avoid-new
    return new Promise<SqliteWorkerResponse>((resolve) => {
      const onMessage = (event: MessageEvent<SqliteWorkerMessage>) => {
        const msg = event.data
        if (!Array.isArray(msg)) return
        if (typeof msg[0] !== "number") return
        if (msg[0] !== id) return

        w.removeEventListener("message", onMessage as never)
        resolve(msg as SqliteWorkerResponse)
      }

      w.addEventListener("message", onMessage as never)
      w.postMessage([id, sql, params])
    })
  }

  const runSelect1 = async () => {
    try {
      const [id, err, result] = await sqliteRequest("SELECT 1 as ok", [])
      if (err) {
        setSqliteSelect1(`error(${id}): ${err}`)
        return
      }
      setSqliteSelect1(JSON.stringify(result))
    } catch (error) {
      setSqliteSelect1(error instanceof Error ? error.message : String(error))
    }
  }

  const listLoadedMigrations = () => {
    const loaded = loadMigrations()
    setMigrationList(
      loaded.map((m) => `${m.path}\n${m.sql.trim()}`).join("\n\n---\n\n")
    )
  }

  return (
    <section>
      <h1>Spikes: Local-first infra</h1>
      <p>
        This route validates Worker bundling and a minimal SQLite OPFS worker
        boot.
      </p>

      <dl>
        <dt>crossOriginIsolated</dt>
        <dd>
          {String(
            typeof window === "undefined" ? false : window.crossOriginIsolated
          )}
        </dd>
      </dl>

      <h2>Worker bundling</h2>
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

      <h2>SQLite OPFS worker (spike)</h2>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={startSqlite}
          disabled={sqliteStatus() === "starting"}
        >
          Start sqlite worker
        </button>
        <button
          type="button"
          onClick={runSelect1}
          disabled={sqliteStatus() !== "ready"}
        >
          SELECT 1
        </button>
        <button
          type="button"
          onClick={stopSqlite}
          disabled={sqliteStatus() === "idle"}
        >
          Stop sqlite worker
        </button>
      </div>
      <dl>
        <dt>Status</dt>
        <dd>{sqliteStatus()}</dd>
        <dt>Last message</dt>
        <dd>
          <pre>{sqliteLastMessage()}</pre>
        </dd>
        <dt>SELECT 1 result</dt>
        <dd>
          <pre>{sqliteSelect1()}</pre>
        </dd>
      </dl>

      <h2>Migration loader (spike)</h2>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" onClick={listLoadedMigrations}>
          Load migrations
        </button>
      </div>
      <pre>{migrationList()}</pre>
    </section>
  )
}

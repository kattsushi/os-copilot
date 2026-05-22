/// <reference lib="webworker" />

export type WorkerReadyMessage = {
  readonly type: "ready"
}

export type WorkerPongMessage = {
  readonly type: "pong"
  readonly now: number
}

export type WorkerMessage = WorkerReadyMessage | WorkerPongMessage

export type MainPingMessage = {
  readonly type: "ping"
}

declare const self: DedicatedWorkerGlobalScope

self.postMessage({ type: "ready" } satisfies WorkerReadyMessage)

self.addEventListener("message", (event: MessageEvent<MainPingMessage>) => {
  if (event.data?.type !== "ping") return

  self.postMessage({
    type: "pong",
    now: Date.now(),
  } satisfies WorkerPongMessage)
})

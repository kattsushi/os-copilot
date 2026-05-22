/// <reference lib="webworker" />

import { OpfsWorker } from "@effect/sql-sqlite-wasm"
import { Effect } from "effect"

declare const self: DedicatedWorkerGlobalScope

const program = OpfsWorker.run({
  port: self,
  dbName: "os-copilot-spike.sqlite",
})

const main = async () => {
  try {
    await Effect.runPromise(program)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    self.postMessage({ type: "fatal", message } as const)
  }
}

void main()

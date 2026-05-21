import { render } from "solid-js/web"
import { afterEach, describe, expect, it } from "vitest"

import { Button, Center, Dialog, DialogContent, DialogTitle } from "@os-copilot/ui"

afterEach(() => {
  document.body.replaceChildren()
})

describe("SPA smoke coverage", () => {
  it("mounts a custom layout primitive in jsdom", () => {
    const host = document.createElement("div")
    document.body.append(host)
    const dispose = render(() => <Center>Mounted layout</Center>, host)

    expect(host.querySelector('[data-slot="center"]')?.textContent).toBe(
      "Mounted layout",
    )
    dispose()
  })

  it("mounts Button in jsdom", () => {
    const host = document.createElement("div")
    document.body.append(host)
    const dispose = render(() => <Button>Continue</Button>, host)

    expect(host.querySelector('[data-slot="button"]')?.textContent).toBe(
      "Continue",
    )
    dispose()
  })

  it("mounts Dialog smoke markup in jsdom", () => {
    const host = document.createElement("div")
    document.body.append(host)
    const dispose = render(
      () => (
        <Dialog open>
          <DialogContent>
            <DialogTitle>Mounted dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      ),
      host,
    )

    expect(document.body.textContent).toContain("Mounted dialog")
    dispose()
  })
})

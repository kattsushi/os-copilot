import { render } from "solid-js/web"
import { afterEach, describe, expect, it } from "vitest"

import {
  Button,
  Center,
  CopyIdButton,
  DataTable,
  DataTableFilters,
  Dialog,
  DialogContent,
  DialogTitle,
  Marquee,
  toast,
  Toaster,
} from "@os-copilot/ui"

afterEach(() => {
  document.body.replaceChildren()
  toast.dismiss()
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

  it("mounts data table utilities in jsdom", () => {
    const host = document.createElement("div")
    document.body.append(host)
    const dispose = render(
      () => (
        <div>
          <DataTableFilters
            filters={[
              {
                id: "name",
                label: "Name",
                value: "Ada",
                onValueChange: () => {},
              },
            ]}
          />
          <DataTable
            columns={[{ accessorKey: "name", header: "Name" }]}
            data={[{ name: "Ada Lovelace" }]}
            getMobileTitle={(row) => row.name}
          />
        </div>
      ),
      host,
    )

    expect(
      host.querySelector('[data-slot="data-table-filters"]')?.textContent,
    ).toContain("Name")
    expect(
      host.querySelector('[data-slot="data-table"]')?.textContent,
    ).toContain("Ada Lovelace")
    dispose()
  })

  it("mounts interaction utilities in jsdom", () => {
    const host = document.createElement("div")
    document.body.append(host)
    const dispose = render(
      () => (
        <>
          <CopyIdButton value="user_123">Copy</CopyIdButton>
          <Marquee>
            <span>Motion</span>
            <span>Motion</span>
          </Marquee>
          <Toaster />
        </>
      ),
      host,
    )

    toast.success("Mounted toast")

    expect(
      host.querySelector('[data-slot="copy-id-button"]')?.textContent,
    ).toContain("Copy")
    expect(host.querySelector('[data-slot="marquee"]')?.textContent).toContain(
      "Motion",
    )
    expect(document.body.textContent).toContain("Mounted toast")
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

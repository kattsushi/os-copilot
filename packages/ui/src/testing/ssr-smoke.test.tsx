import path from "node:path"
import { fileURLToPath } from "node:url"

import { createServer, type ViteDevServer } from "vite"
import viteSolid from "vite-plugin-solid"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

type SsrFixture = {
  renderButtonFixture: () => string
  renderCenterFixture: () => string
  renderCopyIdButtonFixture: () => string
  renderDataTableFixture: () => string
  renderDataTableFiltersFixture: () => string
  renderGridPatternFixture: () => string
  renderMarqueeFixture: () => string
  renderToastFixture: () => string
}

const testDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(testDir, "../..")
const fixturePath = path.resolve(testDir, "ssr-fixture.tsx")

let server: ViteDevServer
let fixture: SsrFixture

beforeAll(async () => {
  server = await createServer({
    configFile: false,
    root: packageRoot,
    logLevel: "silent",
    plugins: [viteSolid({ ssr: true, solid: { hydratable: false } })],
  })
  fixture = (await server.ssrLoadModule(fixturePath)) as SsrFixture
})

afterAll(async () => {
  await server.close()
})

describe("SSR smoke coverage", () => {
  it("renders a custom layout primitive on the server", () => {
    const html = fixture.renderCenterFixture()

    expect(html).toContain('data-slot="center"')
    expect(html).toContain("Layout content")
  })

  it("renders Button on the server", () => {
    const html = fixture.renderButtonFixture()

    expect(html).toContain('data-slot="button"')
    expect(html).toContain("Save")
  })

  it("renders decorative layout markup on the server", () => {
    const html = fixture.renderGridPatternFixture()

    expect(html).toContain('data-slot="grid-pattern"')
    expect(html).toContain('aria-hidden="true"')
  })

  it("renders data table utilities on the server", () => {
    expect(fixture.renderDataTableFixture()).toContain(
      'data-slot="data-table"',
    )
    expect(fixture.renderDataTableFixture()).toContain("Ada Lovelace")
    expect(fixture.renderDataTableFiltersFixture()).toContain(
      'data-slot="data-table-filters"',
    )
    expect(fixture.renderDataTableFiltersFixture()).toContain("Search by name")
  })

  it("renders interaction utilities on the server", () => {
    expect(fixture.renderCopyIdButtonFixture()).toContain(
      'data-slot="copy-id-button"',
    )
    expect(fixture.renderMarqueeFixture()).toContain('data-slot="marquee"')
    expect(fixture.renderToastFixture()).toContain("Notifications")
  })
})

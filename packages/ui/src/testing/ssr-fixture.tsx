import { renderToString } from "solid-js/web"

import { Button } from "../components/ui/button"
import { Center } from "../components/ui/center"
import { CopyIdButton } from "../components/ui/copy-id-button"
import { DataTable } from "../components/ui/data-table"
import { DataTableFilters } from "../components/ui/data-table-filters"
import { GridPattern } from "../components/ui/grid-pattern"
import { Marquee } from "../components/ui/marquee"
import { Toaster } from "../components/ui/toast"

export function renderCenterFixture() {
  return renderToString(() => <Center>Layout content</Center>, {
    renderId: "center",
  })
}

export function renderButtonFixture() {
  return renderToString(() => <Button>Save</Button>, { renderId: "button" })
}

export function renderGridPatternFixture() {
  return renderToString(() => <GridPattern />)
}

export function renderCopyIdButtonFixture() {
  return renderToString(() => (
    <CopyIdButton value="user_123">Copy user ID</CopyIdButton>
  ))
}

export function renderMarqueeFixture() {
  return renderToString(() => (
    <Marquee>
      <span>Motion content</span>
      <span>Motion content</span>
    </Marquee>
  ))
}

export function renderToastFixture() {
  return renderToString(() => <Toaster />)
}

export function renderDataTableFixture() {
  return renderToString(() => (
    <DataTable
      columns={[
        { accessorKey: "name", header: "Name" },
        { accessorKey: "role", header: "Role" },
      ]}
      data={[{ name: "Ada Lovelace", role: "Engineer" }]}
      getMobileTitle={(row) => row.name}
    />
  ))
}

export function renderDataTableFiltersFixture() {
  return renderToString(() => (
    <DataTableFilters
      filters={[
        {
          id: "name",
          label: "Name",
          value: "Ada",
          onValueChange: () => {},
          placeholder: "Search by name",
        },
      ]}
    />
  ))
}

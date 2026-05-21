import { createMemo, createSignal } from "solid-js"
import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { DataTable } from "#components/ui/data-table"
import { DataTableFilters } from "#components/ui/data-table-filters"

import type { ColumnDef } from "@tanstack/solid-table"

type Person = {
  name: string
  role: string
  team: string
}

const people: Array<Person> = [
  { name: "Ada Lovelace", role: "Engineer", team: "Platform" },
  { name: "Grace Hopper", role: "Admiral", team: "Compiler" },
  { name: "Katherine Johnson", role: "Mathematician", team: "Flight" },
]

const columns: Array<ColumnDef<Person, unknown>> = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "team", header: "Team" },
]

const meta = {
  title: "UI/Data Table Filters",
  component: DataTableFilters,
  parameters: {
    docs: {
      description: {
        component:
          "Touch-friendly filter controls for DataTable. The panel is collapsible on mobile and open by default for quick refinement.",
      },
    },
  },
} satisfies Meta<typeof DataTableFilters>

export default meta

type Story = StoryObj<typeof meta>

export const FilteredPeople: Story = {
  render: () => {
    const [name, setName] = createSignal("")
    const [team, setTeam] = createSignal("")
    const filteredPeople = createMemo(() => {
      const nameQuery = name().trim().toLowerCase()
      const teamQuery = team().trim().toLowerCase()

      return people.filter(
        (person) =>
          person.name.toLowerCase().includes(nameQuery) &&
          person.team.toLowerCase().includes(teamQuery),
      )
    })

    return (
      <div class="space-y-4">
        <DataTableFilters
          filters={[
            {
              id: "name",
              label: "Name",
              value: name(),
              onValueChange: setName,
              placeholder: "Search by name",
            },
            {
              id: "team",
              label: "Team",
              value: team(),
              onValueChange: setTeam,
              placeholder: "Search by team",
            },
          ]}
          onClear={() => {
            setName("")
            setTeam("")
          }}
        />
        <DataTable
          columns={columns}
          data={filteredPeople()}
          getMobileTitle={(person) => person.name}
          emptyMessage="No people match those filters."
        />
      </div>
    )
  },
}

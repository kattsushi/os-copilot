import type { Meta, StoryObj } from "storybook-solidjs-vite"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table"

const meta = { title: "UI/Table", component: Table } satisfies Meta<
  typeof Table
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>UI package</TableCell>
          <TableCell>Ready</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

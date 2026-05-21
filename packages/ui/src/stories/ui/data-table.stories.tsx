import type { ColumnDef } from "@tanstack/solid-table"
import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Badge } from "#components/ui/badge"
import { DataTable } from "#components/ui/data-table"

type Invoice = {
  id: string
  customer: string
  status: "Paid" | "Pending" | "Overdue"
  total: string
}

const invoices: Array<Invoice> = [
  {
    id: "INV-1001",
    customer: "Ada Lovelace",
    status: "Paid",
    total: "$125.00",
  },
  {
    id: "INV-1002",
    customer: "Grace Hopper",
    status: "Pending",
    total: "$89.00",
  },
  {
    id: "INV-1003",
    customer: "Katherine Johnson",
    status: "Overdue",
    total: "$210.00",
  },
]

const columns: Array<ColumnDef<Invoice, unknown>> = [
  {
    accessorKey: "id",
    header: "Invoice",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => (
      <Badge
        variant={info.getValue() === "Overdue" ? "destructive" : "secondary"}
      >
        {String(info.getValue())}
      </Badge>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
  },
]

const meta = {
  title: "UI/Data Table",
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component:
          "Mobile-first table powered by TanStack Solid Table. Narrow screens render stacked cards while desktop uses the shared Table primitives.",
      },
    },
  },
} satisfies Meta<typeof DataTable>

export default meta

type Story = StoryObj<typeof meta>

export const ResponsiveInvoices: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={invoices}
      getMobileTitle={(invoice) => invoice.id}
      emptyMessage="No invoices found."
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyMessage="No invoices match your filters."
    />
  ),
}

import { type ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table"
import { type ComponentProps, createMemo, For, Show, splitProps } from "solid-js"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui/table"
import { cn } from "#lib/utils"

type DataTableProps<TData> = Omit<ComponentProps<"div">, "children"> & {
  columns: Array<ColumnDef<TData, unknown>>
  data: Array<TData>
  emptyMessage?: string
  getMobileTitle?: (row: TData) => string
}

const getHeaderLabel = <TData,>(
  column: ColumnDef<TData, unknown>,
  fallback: string,
) => {
  if (typeof column.header === "string") {
    return column.header
  }

  if (typeof column.id === "string") {
    return column.id
  }

  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    return column.accessorKey
  }

  return fallback
}

const DataTable = <TData,>(props: DataTableProps<TData>) => {
  const [local, others] = splitProps(props, [
    "class",
    "columns",
    "data",
    "emptyMessage",
    "getMobileTitle",
  ])

  const table = createMemo(() =>
    createSolidTable({
      columns: local.columns,
      data: local.data,
      getCoreRowModel: getCoreRowModel(),
    })
  )

  const rows = () => table().getRowModel().rows

  return (
    <div
      data-slot="data-table"
      class={cn("w-full space-y-3", local.class)}
      {...others}
    >
      <div class="hidden md:block">
        <Table>
          <TableHeader>
            <For each={table().getHeaderGroups()}>
              {(headerGroup) => (
                <TableRow>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <TableHead>
                        <Show when={!header.isPlaceholder}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </Show>
                      </TableHead>
                    )}
                  </For>
                </TableRow>
              )}
            </For>
          </TableHeader>
          <TableBody>
            <Show
              when={rows().length > 0}
              fallback={
                <TableRow>
                  <TableCell
                    colSpan={local.columns.length}
                    class="h-24 text-center text-muted-foreground"
                  >
                    {local.emptyMessage ?? "No results."}
                  </TableCell>
                </TableRow>
              }
            >
              <For each={rows()}>
                {(row) => (
                  <TableRow
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <TableCell>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      )}
                    </For>
                  </TableRow>
                )}
              </For>
            </Show>
          </TableBody>
        </Table>
      </div>

      <div class="grid gap-3 md:hidden" data-slot="data-table-mobile">
        <Show
          when={rows().length > 0}
          fallback={
            <div class="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              {local.emptyMessage ?? "No results."}
            </div>
          }
        >
          <For each={rows()}>
            {(row) => (
              <article class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <Show when={local.getMobileTitle?.(row.original)}>
                  {(title) => <h3 class="mb-3 text-sm font-medium">{title()}</h3>}
                </Show>
                <dl class="grid gap-3 text-sm">
                  <For each={row.getVisibleCells()}>
                    {(cell, index) => (
                      <div class="grid gap-1">
                        <dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {getHeaderLabel(
                            cell.column.columnDef,
                            `Field ${index() + 1}`,
                          )}
                        </dt>
                        <dd class="break-words">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </dd>
                      </div>
                    )}
                  </For>
                </dl>
              </article>
            )}
          </For>
        </Show>
      </div>
    </div>
  )
}

export { DataTable, type DataTableProps }

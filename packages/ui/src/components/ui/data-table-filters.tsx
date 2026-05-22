import { ChevronDown, X } from "lucide-solid"
import { type ComponentProps, Index, Show, splitProps } from "solid-js"

import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { cn } from "#lib/utils"

type DataTableTextFilter = {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  type?: "search" | "text"
}

type DataTableFiltersProps = Omit<ComponentProps<"div">, "children"> & {
  filters: Array<DataTableTextFilter>
  defaultOpen?: boolean
  onClear?: () => void
  title?: string
}

const DataTableFilters = (props: DataTableFiltersProps) => {
  const [local, others] = splitProps(props, [
    "class",
    "defaultOpen",
    "filters",
    "onClear",
    "title",
  ])

  const hasActiveFilters = () => local.filters.some((filter) => filter.value.length > 0)

  return (
    <div
      data-slot="data-table-filters"
      class={cn("rounded-lg border bg-card", local.class)}
      {...others}
    >
      <details class="group" open={local.defaultOpen ?? true}>
        <summary class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 md:cursor-default [&::-webkit-details-marker]:hidden">
          <div class="space-y-0.5">
            <p class="text-sm font-medium">{local.title ?? "Filters"}</p>
            <p class="text-xs text-muted-foreground md:hidden">
              Tap to refine results
            </p>
          </div>
          <ChevronDown
            class="size-4 transition-transform group-open:rotate-180 md:hidden"
            aria-hidden="true"
          />
        </summary>

        <div class="grid gap-3 border-t p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Index each={local.filters}>
              {(filter) => (
                <label
                  class="grid gap-2 text-sm font-medium"
                  for={`data-table-filter-${filter().id}`}
                >
                  <span>{filter().label}</span>
                  <Input
                    id={`data-table-filter-${filter().id}`}
                    type={filter().type ?? "search"}
                    inputMode="search"
                    value={filter().value}
                    placeholder={filter().placeholder}
                    onInput={(event) => filter().onValueChange(event.currentTarget.value)}
                    class="min-h-11"
                  />
                </label>
              )}
            </Index>
          </div>

          <Show when={local.onClear}>
            {(onClear) => (
              <Button
                type="button"
                variant="outline"
                class="min-h-11 w-full gap-2 md:w-auto"
                disabled={!hasActiveFilters()}
                onClick={onClear()}
              >
                <X class="size-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </Show>
        </div>
      </details>
    </div>
  )
}

export { DataTableFilters, type DataTableFiltersProps, type DataTableTextFilter }

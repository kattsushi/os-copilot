import { describe, expect, it } from "vitest"

import {
  Button as RootButton,
  Center,
  cn,
  CopyIdButton,
  DataTable,
  DataTableFilters,
  Float,
  Grid,
  GridPattern,
  Marquee,
  Stack,
  toast,
  Toaster,
} from "@os-copilot/ui"
import { Button as SubpathButton } from "@os-copilot/ui/button"
import { Button as SourceRoutedButton } from "@os-copilot/ui/components/ui/button"
import { Center as SourceRoutedCenter } from "@os-copilot/ui/components/ui/center"
import { Float as SourceRoutedFloat } from "@os-copilot/ui/components/ui/float"
import { Grid as SourceRoutedGrid } from "@os-copilot/ui/components/ui/grid"
import { GridPattern as SourceRoutedGridPattern } from "@os-copilot/ui/components/ui/grid-pattern"
import { Stack as SourceRoutedStack } from "@os-copilot/ui/components/ui/stack"
import { cn as SourceRoutedCn } from "@os-copilot/ui/lib/utils"

const publicComponentSubpathImports = {
  "alert-dialog": () => import("@os-copilot/ui/alert-dialog"),
  avatar: () => import("@os-copilot/ui/avatar"),
  badge: () => import("@os-copilot/ui/badge"),
  button: () => import("@os-copilot/ui/button"),
  card: () => import("@os-copilot/ui/card"),
  center: () => import("@os-copilot/ui/center"),
  chart: () => import("@os-copilot/ui/chart"),
  checkbox: () => import("@os-copilot/ui/checkbox"),
  collapsible: () => import("@os-copilot/ui/collapsible"),
  combobox: () => import("@os-copilot/ui/combobox"),
  "copy-id-button": () => import("@os-copilot/ui/copy-id-button"),
  "data-table": () => import("@os-copilot/ui/data-table"),
  "data-table-filters": () => import("@os-copilot/ui/data-table-filters"),
  dialog: () => import("@os-copilot/ui/dialog"),
  "dropdown-menu": () => import("@os-copilot/ui/dropdown-menu"),
  empty: () => import("@os-copilot/ui/empty"),
  float: () => import("@os-copilot/ui/float"),
  grid: () => import("@os-copilot/ui/grid"),
  "grid-pattern": () => import("@os-copilot/ui/grid-pattern"),
  input: () => import("@os-copilot/ui/input"),
  "input-group": () => import("@os-copilot/ui/input-group"),
  label: () => import("@os-copilot/ui/label"),
  marquee: () => import("@os-copilot/ui/marquee"),
  pagination: () => import("@os-copilot/ui/pagination"),
  select: () => import("@os-copilot/ui/select"),
  separator: () => import("@os-copilot/ui/separator"),
  sheet: () => import("@os-copilot/ui/sheet"),
  sidebar: () => import("@os-copilot/ui/sidebar"),
  stack: () => import("@os-copilot/ui/stack"),
  skeleton: () => import("@os-copilot/ui/skeleton"),
  table: () => import("@os-copilot/ui/table"),
  textarea: () => import("@os-copilot/ui/textarea"),
  toast: () => import("@os-copilot/ui/toast"),
  tooltip: () => import("@os-copilot/ui/tooltip"),
} as const

describe("ui package public exports", () => {
  it("resolves root, ergonomic subpath, shadcn source-routed, and css exports", async () => {
    await expect(import("@os-copilot/ui/styles.css")).resolves.toBeDefined()

    expect(RootButton).toBe(SubpathButton)
    expect(RootButton).toBe(SourceRoutedButton)
    expect(Center).toBe(SourceRoutedCenter)
    expect(Float).toBe(SourceRoutedFloat)
    expect(Grid).toBe(SourceRoutedGrid)
    expect(GridPattern).toBe(SourceRoutedGridPattern)
    expect(Stack).toBe(SourceRoutedStack)
    expect(CopyIdButton).toBeDefined()
    expect(DataTable).toBeDefined()
    expect(DataTableFilters).toBeDefined()
    expect(Marquee).toBeDefined()
    expect(Toaster).toBeDefined()
    expect(toast).toBeDefined()
    expect(cn("a", false, "b")).toBe("a b")
    expect(SourceRoutedCn("a", undefined, "b")).toBe("a b")
  })

  it("resolves every public component ergonomic subpath", async () => {
    await Promise.all(
      Object.entries(publicComponentSubpathImports).map(
        async ([subpath, load]) => {
          await expect(load(), subpath).resolves.toBeDefined()
        },
      ),
    )
  })
})

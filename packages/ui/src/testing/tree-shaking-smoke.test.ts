import { describe, expect, it } from "vitest"

import { Button as RootButton, Center, cn, Float, Grid, GridPattern, Stack } from "@os-copilot/ui"
import { Button as SubpathButton } from "@os-copilot/ui/button"
import { Button as SourceRoutedButton } from "@os-copilot/ui/components/ui/button"
import { Center as SourceRoutedCenter } from "@os-copilot/ui/components/ui/center"
import { Float as SourceRoutedFloat } from "@os-copilot/ui/components/ui/float"
import { Grid as SourceRoutedGrid } from "@os-copilot/ui/components/ui/grid"
import { GridPattern as SourceRoutedGridPattern } from "@os-copilot/ui/components/ui/grid-pattern"
import { Stack as SourceRoutedStack } from "@os-copilot/ui/components/ui/stack"
import { cn as SourceRoutedCn } from "@os-copilot/ui/lib/utils"

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
    expect(cn("a", false, "b")).toBe("a b")
    expect(SourceRoutedCn("a", undefined, "b")).toBe("a b")
  })
})

import { describe, expect, it } from "vitest"

import { Button as RootButton, cn } from "@os-copilot/ui"
import { Button as SubpathButton } from "@os-copilot/ui/button"
import { Button as SourceRoutedButton } from "@os-copilot/ui/components/ui/button"
import { cn as SourceRoutedCn } from "@os-copilot/ui/lib/utils"

describe("ui package public exports", () => {
  it("resolves root, ergonomic subpath, shadcn source-routed, and css exports", async () => {
    await expect(import("@os-copilot/ui/styles.css")).resolves.toBeDefined()

    expect(RootButton).toBe(SubpathButton)
    expect(RootButton).toBe(SourceRoutedButton)
    expect(cn("a", false, "b")).toBe("a b")
    expect(SourceRoutedCn("a", undefined, "b")).toBe("a b")
  })
})

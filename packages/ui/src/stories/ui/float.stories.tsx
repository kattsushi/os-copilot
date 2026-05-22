import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Badge } from "#components/ui/badge"
import { Float } from "#components/ui/float"

const meta = {
  title: "UI/Float",
  component: Float,
} satisfies Meta<typeof Float>

export default meta

type Story = StoryObj<typeof meta>

export const BadgeOverlay: Story = {
  render: () => (
    <div class="relative min-h-48 overflow-hidden rounded-xl border bg-muted p-6">
      <p class="max-w-xs text-sm text-muted-foreground">
        Float positions non-interactive status content without changing document
        flow.
      </p>
      <Float placement="top-end">
        <Badge>New</Badge>
      </Float>
    </div>
  ),
}

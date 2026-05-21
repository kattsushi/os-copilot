import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { GridPattern } from "#components/ui/grid-pattern"

const meta = {
  title: "UI/Grid Pattern",
  component: GridPattern,
} satisfies Meta<typeof GridPattern>

export default meta

type Story = StoryObj<typeof meta>

export const DecorativeBackground: Story = {
  render: () => (
    <section class="relative overflow-hidden rounded-xl border bg-background p-8">
      <GridPattern class="opacity-40" />
      <div class="relative max-w-sm">
        <p class="text-sm font-medium">Decorative grid</p>
        <p class="mt-2 text-sm text-muted-foreground">
          The SVG is aria-hidden by default and safe to render on the server.
        </p>
      </div>
    </section>
  ),
}

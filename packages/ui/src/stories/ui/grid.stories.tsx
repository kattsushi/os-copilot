import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Grid } from "#components/ui/grid"

const meta = {
  title: "UI/Grid",
  component: Grid,
} satisfies Meta<typeof Grid>

export default meta

type Story = StoryObj<typeof meta>

export const ResponsiveCards: Story = {
  render: () => (
    <Grid minItemWidth="10rem" gap="sm">
      {Array.from({ length: 4 }, (_, index) => (
        <article class="rounded-lg border bg-card p-4 text-card-foreground">
          <h3 class="text-sm font-medium">Card {index + 1}</h3>
          <p class="mt-1 text-xs text-muted-foreground">
            Auto-fits from one mobile column upward.
          </p>
        </article>
      ))}
    </Grid>
  ),
}

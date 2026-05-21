import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Stack } from "#components/ui/stack"

const meta = {
  title: "UI/Stack",
  component: Stack,
} satisfies Meta<typeof Stack>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Stack gap="sm" class="rounded-lg border p-4">
      <div class="rounded-md bg-muted p-3 text-sm">Account summary</div>
      <div class="rounded-md bg-muted p-3 text-sm">Recent activity</div>
      <div class="rounded-md bg-muted p-3 text-sm">Next steps</div>
    </Stack>
  ),
}

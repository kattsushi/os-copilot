import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Center } from "#components/ui/center"

const meta = {
  title: "UI/Center",
  component: Center,
} satisfies Meta<typeof Center>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Center class="min-h-40 rounded-lg border border-dashed p-6 text-center">
      <p class="max-w-xs text-sm text-muted-foreground">
        Center keeps compact content readable on mobile and centered in its container.
      </p>
    </Center>
  ),
}

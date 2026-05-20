import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Avatar, AvatarFallback } from "#components/ui/avatar"

const meta = { title: "UI/Avatar" } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>OC</AvatarFallback>
    </Avatar>
  ),
}

import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Separator } from "#components/ui/separator"

const meta = { title: "UI/Separator", component: Separator } satisfies Meta<typeof Separator>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <div class="w-80">
      <p>Top</p>
      <Separator />
      <p>Bottom</p>
    </div>
  ),
}

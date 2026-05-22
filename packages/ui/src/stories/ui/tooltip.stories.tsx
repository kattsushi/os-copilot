import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Button } from "#components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui/tooltip"

const meta = { title: "UI/Tooltip", component: Tooltip } satisfies Meta<
  typeof Tooltip
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger as={Button}>Hover</TooltipTrigger>
      <TooltipContent>Helpful context</TooltipContent>
    </Tooltip>
  ),
}

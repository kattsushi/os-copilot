import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#components/ui/collapsible"

const meta = { title: "UI/Collapsible", component: Collapsible } satisfies Meta<typeof Collapsible>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Hidden content</CollapsibleContent>
    </Collapsible>
  ),
}

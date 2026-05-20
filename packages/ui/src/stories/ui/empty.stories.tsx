import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "#components/ui/empty"

const meta = { title: "UI/Empty", component: Empty } satisfies Meta<typeof Empty>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>Try adjusting filters.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
}

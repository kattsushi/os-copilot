import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Skeleton } from "#components/ui/skeleton"

const meta = { title: "UI/Skeleton", component: Skeleton } satisfies Meta<
  typeof Skeleton
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { render: () => <Skeleton class="h-12 w-80" /> }

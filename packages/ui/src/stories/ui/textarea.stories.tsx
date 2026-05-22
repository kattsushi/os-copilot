import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Textarea } from "#components/ui/textarea"

const meta = { title: "UI/Textarea", component: Textarea } satisfies Meta<
  typeof Textarea
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { render: () => <Textarea placeholder="Notes" /> }

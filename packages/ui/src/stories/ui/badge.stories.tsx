import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Badge } from "#components/ui/badge"

const meta = { title: "UI/Badge", component: Badge } satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { render: () => <Badge>Mobile first</Badge> }

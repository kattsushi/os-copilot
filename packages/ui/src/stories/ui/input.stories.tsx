import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Input } from "#components/ui/input"

const meta = { title: "UI/Input", component: Input } satisfies Meta<typeof Input>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { render: () => <Input placeholder="Search" /> }

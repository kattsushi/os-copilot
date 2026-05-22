import type { Meta, StoryObj } from "storybook-solidjs-vite"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "#components/ui/input-group"

const meta = { title: "UI/Input Group", component: InputGroup } satisfies Meta<
  typeof InputGroup
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <InputGroup class="w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="os-copilot.dev" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Go</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

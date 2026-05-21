import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Checkbox, CheckboxLabel } from "#components/ui/checkbox"

const meta = { title: "UI/Checkbox", component: Checkbox } satisfies Meta<
  typeof Checkbox
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Checkbox id="terms" class="inline-flex items-center gap-2">
      <CheckboxLabel for="terms">Accept terms</CheckboxLabel>
    </Checkbox>
  ),
}

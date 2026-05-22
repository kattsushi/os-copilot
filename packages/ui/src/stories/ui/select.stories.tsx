import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#components/ui/select"

const fruits = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]

const meta = { title: "UI/Select", component: Select } satisfies Meta<
  typeof Select
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Select
      options={fruits}
      placeholder="Choose a fruit"
      itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
    >
      <SelectTrigger aria-label="Fruit" class="w-56">
        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  ),
}

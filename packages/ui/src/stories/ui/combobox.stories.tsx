import type { Meta, StoryObj } from "storybook-solidjs-vite"

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
} from "#components/ui/combobox"

const fruits = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]

const meta = { title: "UI/Combobox", component: Combobox } satisfies Meta<
  typeof Combobox
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Combobox
      options={fruits}
      placeholder="Search a fruit"
      itemComponent={(props) => (
        <ComboboxItem item={props.item}>{props.item.rawValue}</ComboboxItem>
      )}
    >
      <ComboboxInput class="w-64" />
      <ComboboxContent />
    </Combobox>
  ),
}

import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Button } from "#components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"

const meta = {
  title: "UI/Dropdown Menu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger as={Button} class="">
        Menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

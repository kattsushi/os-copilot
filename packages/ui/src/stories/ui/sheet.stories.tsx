import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Button } from "#components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#components/ui/sheet"

const meta = { title: "UI/Sheet", component: Sheet } satisfies Meta<
  typeof Sheet
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger as={Button}>Open sheet</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Mobile sheet</SheetTitle>
          <SheetDescription>Drawer-style content.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

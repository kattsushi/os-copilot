import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Button } from "#components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#components/ui/dialog"

const meta = { title: "UI/Dialog", component: Dialog } satisfies Meta<
  typeof Dialog
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger as={Button}>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog</DialogTitle>
          <DialogDescription>Mobile dialog content.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
}

import type { Meta, StoryObj } from "storybook-solidjs-vite"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#components/ui/alert-dialog"
import { Button } from "#components/ui/button"

const meta = {
  title: "UI/Alert Dialog",
  component: AlertDialog,
} satisfies Meta<typeof AlertDialog>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger as={Button}>Open</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm action</AlertDialogTitle>
          <AlertDialogDescription>
            This is optimized for mobile review.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Button } from "#components/ui/button"
import { toast, Toaster } from "#components/ui/toast"

const meta = {
  title: "UI/Toast",
  parameters: {
    docs: {
      description: {
        component:
          "Zaidan Sonner toast wrapper for Solid. Use `Toaster` once near the app root and call `toast.*` from event handlers.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const SonnerToast: Story = {
  render: () => (
    <div class="flex flex-col gap-3 rounded-lg border p-4">
      <p class="text-sm text-muted-foreground">
        Toasts render through the Zaidan Sonner wrapper and inherit UI tokens.
      </p>
      <div class="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast.success("Saved", {
              description: "The Sonner toast announced this update.",
            })}
        >
          Show success
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            toast.error("Could not save", {
              description: "Try again from a stable connection.",
            })}
        >
          Show error
        </Button>
      </div>
      <Toaster />
    </div>
  ),
}

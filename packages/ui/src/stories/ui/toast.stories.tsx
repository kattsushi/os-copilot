import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Button } from "#components/ui/button"
import { createToastStore, ToastProvider, ToastViewport } from "#components/ui/toast"

const meta = {
  title: "UI/Toast",
  parameters: {
    docs: {
      description: {
        component:
          "Lightweight local Solid toast provider/API. This slice intentionally avoids Sonner so the adapter can be swapped later without adding a dependency now.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const LocalProvider: Story = {
  render: () => {
    const store = createToastStore()

    return (
      <ToastProvider store={store}>
        <div class="flex flex-col gap-3 rounded-lg border p-4">
          <p class="text-sm text-muted-foreground">
            Toasts render in an accessible live region without a portal or browser globals during SSR.
          </p>
          <div class="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                store.toast({
                  title: "Saved",
                  description: "The local toast store announced this update.",
                })}
            >
              Show toast
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                store.toast({
                  title: "Could not save",
                  description: "Try again from a stable connection.",
                  variant: "destructive",
                })}
            >
              Show error
            </Button>
          </div>
        </div>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

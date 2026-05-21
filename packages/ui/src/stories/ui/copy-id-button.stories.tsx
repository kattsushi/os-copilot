import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { CopyIdButton } from "#components/ui/copy-id-button"

const meta = {
  title: "UI/Copy ID Button",
  component: CopyIdButton,
  parameters: {
    docs: {
      description: {
        component:
          "Mobile-safe copy affordance. Clipboard access happens only from the click handler; unavailable clipboard APIs show accessible failure feedback.",
      },
    },
  },
} satisfies Meta<typeof CopyIdButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <CopyIdButton value="usr_01HX8J7QZ6KV">Copy user ID</CopyIdButton>,
}

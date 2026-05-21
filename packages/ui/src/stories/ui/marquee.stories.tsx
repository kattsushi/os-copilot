import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Badge } from "#components/ui/badge"
import { Marquee } from "#components/ui/marquee"

const meta = {
  title: "UI/Marquee",
  component: Marquee,
  parameters: {
    docs: {
      description: {
        component:
          "SSR-safe optional motion primitive. It pauses on hover/focus by default and disables animation for `prefers-reduced-motion: reduce`.",
      },
    },
  },
} satisfies Meta<typeof Marquee>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Marquee speed="slow" class="rounded-lg border bg-muted/40 px-3">
      {Array.from({ length: 2 }).map(() => (
        <>
          <Badge variant="secondary">Mobile first</Badge>
          <Badge variant="outline">SSR-safe</Badge>
          <Badge variant="secondary">Reduced motion aware</Badge>
          <Badge variant="outline">Pause on hover</Badge>
        </>
      ))}
    </Marquee>
  ),
}

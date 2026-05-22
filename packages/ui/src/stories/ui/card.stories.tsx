import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#components/ui/card"

const meta = { title: "UI/Card", component: Card } satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <Card class="w-80">
      <CardHeader>
        <CardTitle>Card</CardTitle>
        <CardDescription>Mobile card content.</CardDescription>
      </CardHeader>
      <CardContent>Reusable UI package.</CardContent>
    </Card>
  ),
}

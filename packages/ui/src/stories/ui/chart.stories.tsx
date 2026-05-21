import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { ChartContainer } from "#components/ui/chart"

const meta = { title: "UI/Chart", component: ChartContainer } satisfies Meta<
  typeof ChartContainer
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <ChartContainer
      class="h-48 w-80"
      config={{ value: { label: "Value" } }}
      option={{
        xAxis: { type: "category", data: ["A", "B"] },
        yAxis: { type: "value" },
        series: [{ type: "bar", data: [1, 2] }],
      }}
    />
  ),
}

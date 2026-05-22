import type { Meta, StoryObj } from "storybook-solidjs-vite"

import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "#components/ui/sidebar"

const meta = { title: "UI/Sidebar", component: Sidebar } satisfies Meta<typeof Sidebar>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>Navigation</SidebarHeader>
        <SidebarContent>Content</SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
}

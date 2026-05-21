import type { Preview } from "storybook-solidjs-vite"

// oxlint-disable-next-line import/no-unassigned-import -- Storybook preview applies global UI styles.
import "../src/styles.css"

const preview: Preview = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    layout: "centered",
  },
}

export default preview

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-solid"
import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
  useContext,
} from "solid-js"
import { Toaster as Sonner } from "solid-sonner"

import { ColorModeContext } from "#components/color-mode"

type ToasterProps = ComponentProps<typeof Sonner>

const Toaster: Component<ToasterProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "icons",
    "position",
    "style",
    "theme",
  ])
  const colorMode = useContext(ColorModeContext)

  return (
    <Sonner
      theme={local.theme ?? colorMode?.colorMode() ?? "light"}
      class={local.class ?? "toaster group"}
      position={local.position ?? "top-center"}
      icons={{
        success: <CircleCheck class="size-4" />,
        info: <Info class="size-4" />,
        warning: <TriangleAlert class="size-4" />,
        error: <OctagonX class="size-4" />,
        loading: <LoaderCircle class="size-4 animate-spin" />,
        ...local.icons,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          ...local.style,
        } as JSX.CSSProperties
      }
      {...others}
    />
  )
}

export { Toaster }

import type { ComponentProps } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "#lib/utils"

const floatPlacement = {
  "top-start": "top-3 left-3",
  top: "top-3 left-1/2 -translate-x-1/2",
  "top-end": "top-3 right-3",
  "bottom-start": "bottom-3 left-3",
  bottom: "bottom-3 left-1/2 -translate-x-1/2",
  "bottom-end": "right-3 bottom-3",
} as const

type FloatPlacement = keyof typeof floatPlacement

type FloatProps = ComponentProps<"div"> & {
  placement?: FloatPlacement
}

const Float = (props: FloatProps) => {
  const [local, others] = splitProps(props, ["class", "placement"])

  return (
    <div
      data-slot="float"
      class={cn(
        "pointer-events-none absolute z-10 max-w-[calc(100%-1.5rem)]",
        floatPlacement[local.placement ?? "bottom-end"],
        local.class,
      )}
      {...others}
    />
  )
}

export { Float, type FloatPlacement, type FloatProps }

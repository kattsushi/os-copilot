import type { ComponentProps } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "#lib/utils"

const stackGap = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const

const stackAlign = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const

type StackGap = keyof typeof stackGap
type StackAlign = keyof typeof stackAlign

type StackProps = ComponentProps<"div"> & {
  gap?: StackGap
  align?: StackAlign
}

const Stack = (props: StackProps) => {
  const [local, others] = splitProps(props, ["class", "gap", "align"])

  return (
    <div
      data-slot="stack"
      class={cn(
        "flex w-full flex-col",
        stackGap[local.gap ?? "md"],
        stackAlign[local.align ?? "stretch"],
        local.class
      )}
      {...others}
    />
  )
}

export { Stack, type StackAlign, type StackGap, type StackProps }

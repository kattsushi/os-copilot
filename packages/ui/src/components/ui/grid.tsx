import type { ComponentProps, JSX } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "#lib/utils"

const gridGap = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const

type GridGap = keyof typeof gridGap

type GridProps = ComponentProps<"div"> & {
  minItemWidth?: string
  gap?: GridGap
}

const Grid = (props: GridProps) => {
  const [local, others] = splitProps(props, [
    "class",
    "style",
    "minItemWidth",
    "gap",
  ])
  const style = () => {
    const baseStyle = {
      "--grid-min-item-width": local.minItemWidth ?? "12rem",
    } as JSX.CSSProperties

    return typeof local.style === "object"
      ? { ...baseStyle, ...local.style }
      : baseStyle
  }

  return (
    <div
      data-slot="grid"
      class={cn(
        "grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,var(--grid-min-item-width)),1fr))]",
        gridGap[local.gap ?? "md"],
        local.class
      )}
      style={style()}
      {...others}
    />
  )
}

export { Grid, type GridGap, type GridProps }

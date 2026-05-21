import type { ComponentProps } from "solid-js"
import { mergeProps, Show, splitProps } from "solid-js"

import { cn } from "#lib/utils"

type GridPatternProps = ComponentProps<"svg"> & {
  size?: number
  title?: string
}

const GridPattern = (props: GridPatternProps) => {
  const mergedProps = mergeProps(
    { size: 32 } satisfies Partial<GridPatternProps>,
    props,
  )
  const [local, others] = splitProps(mergedProps, ["class", "size", "title"])
  const patternId = `grid-pattern-${local.size}`

  return (
    <svg
      data-slot="grid-pattern"
      aria-hidden={local.title ? undefined : "true"}
      role={local.title ? "img" : undefined}
      class={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-border",
        local.class,
      )}
      fill="none"
      {...others}
    >
      <Show when={local.title}>{(title) => <title>{title()}</title>}</Show>
      <defs>
        <pattern
          id={patternId}
          width={local.size}
          height={local.size}
          patternUnits="userSpaceOnUse"
          x="50%"
          y="-1"
        >
          <path
            d={`M ${local.size} 0 L 0 0 0 ${local.size}`}
            stroke="currentColor"
            stroke-width="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

export { GridPattern, type GridPatternProps }

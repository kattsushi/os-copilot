import type { ComponentProps } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "#lib/utils"

type CenterProps = ComponentProps<"div">

const Center = (props: CenterProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      data-slot="center"
      class={cn(
        "mx-auto flex w-full max-w-screen-sm items-center justify-center",
        local.class
      )}
      {...others}
    />
  )
}

export { Center, type CenterProps }

import { type ComponentProps, type JSX, splitProps } from "solid-js"

import { cn } from "#lib/utils"

type MarqueeDirection = "left" | "right"
type MarqueeSpeed = "slow" | "normal" | "fast"

const marqueeDurations: Record<MarqueeSpeed, string> = {
  slow: "32s",
  normal: "20s",
  fast: "12s",
}

type MarqueeProps = ComponentProps<"div"> & {
  direction?: MarqueeDirection
  speed?: MarqueeSpeed
  pauseOnHover?: boolean
}

const Marquee = (props: MarqueeProps) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "direction",
    "pauseOnHover",
    "speed",
    "style",
  ])

  const animationName = () =>
    local.direction === "right"
      ? "os-copilot-marquee-right"
      : "os-copilot-marquee-left"
  const trackStyle = (): JSX.CSSProperties => ({
    "--os-marquee-duration": marqueeDurations[local.speed ?? "normal"],
    animation: `${animationName()} var(--os-marquee-duration) linear infinite`,
    ...(typeof local.style === "object" ? local.style : {}),
  })

  return (
    <div
      class={cn("relative flex w-full overflow-hidden", local.class)}
      data-slot="marquee"
      {...others}
    >
      <style>{marqueeStyle}</style>
      <div
        class={cn(
          "flex min-w-max shrink-0 items-center gap-4 py-1 motion-reduce:animate-none",
          local.pauseOnHover !== false &&
            "hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]",
        )}
        data-slot="marquee-track"
        style={trackStyle()}
      >
        {local.children}
      </div>
    </div>
  )
}

const marqueeStyle = `
@keyframes os-copilot-marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes os-copilot-marquee-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="marquee-track"] {
    animation: none !important;
    transform: none !important;
  }
}
`

export { Marquee, type MarqueeDirection, type MarqueeProps, type MarqueeSpeed }

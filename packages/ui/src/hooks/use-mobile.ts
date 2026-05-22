import { createSignal, onCleanup, onMount } from "solid-js"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = createSignal(false)

  onMount(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    )
    const update = () => setIsMobile(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    onCleanup(() => mediaQuery.removeEventListener("change", update))
  })

  return isMobile
}

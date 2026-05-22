import { Check, Copy, X } from "lucide-solid"
import { createSignal, type JSX, onCleanup, splitProps } from "solid-js"

import { Button, type ButtonProps } from "#components/ui/button"
import { cn } from "#lib/utils"

type CopyStatus = "idle" | "copied" | "failed"

type CopyIdButtonProps = Omit<ButtonProps, "onClick"> & {
  value: string
  copiedLabel?: string
  failedLabel?: string
  idleLabel?: string
  resetDelayMs?: number
  onCopy?: (value: string) => void
  onCopyError?: (error: unknown) => void
}

const CopyIdButton = (props: CopyIdButtonProps) => {
  const [status, setStatus] = createSignal<CopyStatus>("idle")
  const [local, others] = splitProps(props, [
    "value",
    "class",
    "children",
    "copiedLabel",
    "failedLabel",
    "idleLabel",
    "resetDelayMs",
    "onCopy",
    "onCopyError",
  ])

  let resetTimer: ReturnType<typeof setTimeout> | undefined

  onCleanup(() => {
    if (resetTimer) clearTimeout(resetTimer)
  })

  const scheduleReset = () => {
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => setStatus("idle"), local.resetDelayMs ?? 1800)
  }

  const copy = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable")
      }

      await navigator.clipboard.writeText(local.value)
      setStatus("copied")
      local.onCopy?.(local.value)
    } catch (error) {
      setStatus("failed")
      local.onCopyError?.(error)
    } finally {
      scheduleReset()
    }
  }

  const label = () => {
    if (status() === "copied") return local.copiedLabel ?? "Copied"
    if (status() === "failed") return local.failedLabel ?? "Copy failed"
    return local.idleLabel ?? "Copy ID"
  }

  const icon: () => JSX.Element = () => {
    if (status() === "copied") {
      return <Check aria-hidden="true" class="size-4" />
    }
    if (status() === "failed") return <X aria-hidden="true" class="size-4" />
    return <Copy aria-hidden="true" class="size-4" />
  }

  return (
    <Button
      aria-label={label()}
      class={cn("gap-2", local.class)}
      data-slot="copy-id-button"
      onClick={copy}
      type="button"
      variant="outline"
      {...others}
    >
      {icon()}
      <span>{local.children ?? label()}</span>
      <span class="sr-only" role="status" aria-live="polite">
        {status() === "idle" ? "" : label()}
      </span>
    </Button>
  )
}

export { CopyIdButton, type CopyIdButtonProps, type CopyStatus }

import {
  type Accessor,
  type ComponentProps,
  createContext,
  createSignal,
  For,
  type JSX,
  splitProps,
  useContext,
} from "solid-js"

import { Button } from "#components/ui/button"
import { cn } from "#lib/utils"

type ToastVariant = "default" | "success" | "destructive"

type Toast = {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastInput = Omit<Toast, "id"> & {
  id?: string
}

type ToastStore = {
  toasts: Accessor<Array<Toast>>
  toast: (input: ToastInput) => string
  dismiss: (id: string) => void
  clear: () => void
}

const ToastContext = createContext<ToastStore>()

const createToastStore = (): ToastStore => {
  const [toasts, setToasts] = createSignal<Array<Toast>>([])
  let nextId = 0

  const dismiss = (id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }

  const toast = (input: ToastInput) => {
    const id = input.id ?? `toast-${++nextId}`
    const nextToast: Toast = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? "default",
      durationMs: input.durationMs,
    }

    setToasts((current) => [
      nextToast,
      ...current.filter((item) => item.id !== id),
    ])

    if (
      input.durationMs &&
      input.durationMs > 0 &&
      typeof window !== "undefined"
    ) {
      window.setTimeout(() => dismiss(id), input.durationMs)
    }

    return id
  }

  return {
    toasts,
    toast,
    dismiss,
    clear: () => setToasts([]),
  }
}

type ToastProviderProps = {
  children: JSX.Element
  store?: ToastStore
}

const ToastProvider = (props: ToastProviderProps) => {
  const store = props.store ?? createToastStore()

  return (
    <ToastContext.Provider value={store}>
      {props.children}
    </ToastContext.Provider>
  )
}

const useToast = () => {
  const store = useContext(ToastContext)
  if (!store) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return store
}

const toastVariantClasses: Record<ToastVariant, string> = {
  default: "border-border bg-background text-foreground",
  success: "border-green-500/40 bg-green-50 text-green-950 dark:bg-green-950 dark:text-green-50",
  destructive: "border-destructive/40 bg-destructive text-destructive-foreground",
}

type ToastViewportProps = Omit<ComponentProps<"ol">, "children"> & {
  store?: ToastStore
}

const ToastViewport = (props: ToastViewportProps) => {
  const [local, others] = splitProps(props, ["class", "store"])
  const contextStore = useContext(ToastContext)
  const store = () => local.store ?? contextStore

  return (
    <ol
      aria-live="polite"
      aria-relevant="additions text"
      class={cn(
        "fixed inset-x-3 bottom-3 z-50 flex max-h-screen flex-col gap-2 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm",
        local.class,
      )}
      data-slot="toast-viewport"
      role="status"
      {...others}
    >
      <For each={store()?.toasts() ?? []}>
        {(toast) => (
          <li
            class={cn(
              "rounded-lg border p-4 shadow-lg transition-colors",
              toastVariantClasses[toast.variant ?? "default"],
            )}
            data-slot="toast"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 space-y-1">
                <p class="text-sm font-medium leading-none">{toast.title}</p>
                {toast.description && <p class="text-sm opacity-80">{toast.description}</p>}
              </div>
              <Button
                aria-label="Dismiss notification"
                class="size-7 shrink-0"
                onClick={() => store()?.dismiss(toast.id)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                ×
              </Button>
            </div>
          </li>
        )}
      </For>
    </ol>
  )
}

export {
  createToastStore,
  type Toast,
  type ToastInput,
  ToastProvider,
  type ToastProviderProps,
  type ToastStore,
  type ToastVariant,
  ToastViewport,
  type ToastViewportProps,
  useToast,
}

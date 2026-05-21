import { renderToString } from "solid-js/web"

import { Button } from "../components/ui/button"
import { Center } from "../components/ui/center"
import { CopyIdButton } from "../components/ui/copy-id-button"
import { GridPattern } from "../components/ui/grid-pattern"
import { Marquee } from "../components/ui/marquee"
import { createToastStore, ToastProvider, ToastViewport } from "../components/ui/toast"

export function renderCenterFixture() {
  return renderToString(() => <Center>Layout content</Center>, {
    renderId: "center",
  })
}

export function renderButtonFixture() {
  return renderToString(() => <Button>Save</Button>, { renderId: "button" })
}

export function renderGridPatternFixture() {
  return renderToString(() => <GridPattern />)
}

export function renderCopyIdButtonFixture() {
  return renderToString(() => <CopyIdButton value="user_123">Copy user ID</CopyIdButton>)
}

export function renderMarqueeFixture() {
  return renderToString(() => (
    <Marquee>
      <span>Motion content</span>
      <span>Motion content</span>
    </Marquee>
  ))
}

export function renderToastFixture() {
  const store = createToastStore()
  store.toast({ title: "Saved", description: "Server-rendered notification" })

  return renderToString(() => (
    <ToastProvider store={store}>
      <ToastViewport />
    </ToastProvider>
  ))
}

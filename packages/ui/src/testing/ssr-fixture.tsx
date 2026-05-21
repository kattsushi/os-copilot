import { renderToString } from "solid-js/web"

import { Button } from "../components/ui/button"
import { Center } from "../components/ui/center"
import { GridPattern } from "../components/ui/grid-pattern"

export function renderCenterFixture() {
  return renderToString(() => <Center>Layout content</Center>, { renderId: "center" })
}

export function renderButtonFixture() {
  return renderToString(() => <Button>Save</Button>, { renderId: "button" })
}

export function renderGridPatternFixture() {
  return renderToString(() => <GridPattern />)
}


import * as React from "react"

/**
 * PROTOCOLO_TABLET_FIRST_ERGONOMICS - v12.6.0
 * Elevamos el breakpoint a 1024px para que las tablets utilicen el modo Drawer
 * y no consuman espacio de pantalla fijo innecesario.
 */
const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { PANEL_INNER, PANEL_OUTER } from '@/mock/_shared/ui-classes'

type PanelChromeProps = {
  children: ReactNode
  className?: string
  innerClassName?: string
}

/** Double-shell Figma card (stone outer + white inner) used by buy/bridge steps. */
export function PanelChrome({ children, className, innerClassName }: PanelChromeProps) {
  return (
    <div className={cn(PANEL_OUTER, className)}>
      <div className={cn(PANEL_INNER, innerClassName)}>{children}</div>
    </div>
  )
}

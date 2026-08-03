import type { ReactNode } from 'react'

import { ProductStepShell } from '@/mock/_shared'
import { BRIDGE_HERO_SUBTITLE } from '@/mock/bridge/constants'

type BridgeStepShellProps = {
  children: ReactNode
  /** When false, parent owns the product hero (keeps it mounted across family swaps). */
  showHero?: boolean
}

/** Shared Bridge page chrome: product tabs/hero + card slot. */
export function BridgeStepShell({ children, showHero = true }: BridgeStepShellProps) {
  return (
    <ProductStepShell subtitle={BRIDGE_HERO_SUBTITLE} showHero={showHero}>
      {children}
    </ProductStepShell>
  )
}

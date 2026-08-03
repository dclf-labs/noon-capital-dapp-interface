import type { ReactNode } from 'react'

import { BRIDGE_HERO_SUBTITLE } from '@/mock/bridge/constants'
import { ProductHero } from '@/mock/vaults/ProductHero'

type BridgeStepShellProps = {
  children: ReactNode
  /** When false, parent owns the product hero (keeps it mounted across family swaps). */
  showHero?: boolean
}

/** Shared Bridge page chrome: product tabs/hero + card slot. */
export function BridgeStepShell({ children, showHero = true }: BridgeStepShellProps) {
  const card = (
    <div className="flex w-full min-w-0 flex-col items-stretch lg:max-w-[70%] lg:min-w-[45%]">
      <div className="w-full min-w-0">{children}</div>
    </div>
  )

  if (!showHero) return card

  return (
    <div className="flex w-full flex-col items-center pt-6 md:pt-10">
      <div className="flex w-full flex-col items-center gap-6 md:gap-12">
        <ProductHero subtitle={BRIDGE_HERO_SUBTITLE} />
        {card}
      </div>
    </div>
  )
}

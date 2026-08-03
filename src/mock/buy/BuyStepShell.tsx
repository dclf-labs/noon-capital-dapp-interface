import type { ReactNode } from 'react'

import { BUY_HERO_SUBTITLE } from '@/mock/buy/constants'
import type { BuyPoweredBy } from '@/mock/buy/powered-by'
import { PoweredByRow } from '@/mock/buy/PoweredByRow'
import { ProductHero } from '@/mock/vaults/ProductHero'

type BuyStepShellProps = {
  children: ReactNode
  poweredBy?: BuyPoweredBy
  /** When false, parent owns the product hero (keeps it mounted across chain-family swaps). */
  showHero?: boolean
}

/** Shared Buy page chrome: product tabs/hero + card slot + Powered by. */
export function BuyStepShell({ children, poweredBy, showHero = true }: BuyStepShellProps) {
  const card = (
    <div className="flex w-full max-w-[70%] min-w-[45%] flex-col items-stretch gap-4">
      <div className="w-full min-w-0">{children}</div>
      <div className="flex w-full justify-center">
        <PoweredByRow poweredBy={poweredBy} />
      </div>
    </div>
  )

  if (!showHero) {
    return card
  }

  return (
    <div className="flex w-full flex-col items-center pt-6 md:pt-10">
      <div className="flex w-full flex-col items-center gap-6 md:gap-12">
        <ProductHero subtitle={BUY_HERO_SUBTITLE} />
        {card}
      </div>
    </div>
  )
}

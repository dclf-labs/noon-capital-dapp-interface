import type { ReactNode } from 'react'

import { ProductStepShell } from '@/mock/_shared'
import { BUY_HERO_SUBTITLE } from '@/mock/buy/constants'
import type { BuyPoweredBy } from '@/mock/buy/powered-by'
import { PoweredByRow } from '@/mock/buy/PoweredByRow'

type BuyStepShellProps = {
  children: ReactNode
  poweredBy?: BuyPoweredBy
  /** When false, parent owns the product hero (keeps it mounted across chain-family swaps). */
  showHero?: boolean
}

/** Shared Buy page chrome: product tabs/hero + card slot + Powered by. */
export function BuyStepShell({ children, poweredBy, showHero = true }: BuyStepShellProps) {
  return (
    <ProductStepShell
      subtitle={BUY_HERO_SUBTITLE}
      showHero={showHero}
      footer={<PoweredByRow poweredBy={poweredBy} />}
    >
      {children}
    </ProductStepShell>
  )
}

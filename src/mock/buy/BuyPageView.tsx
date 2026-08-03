import { BuyPanel } from '@/mock/buy/BuyPanel'
import { BuyStepShell } from '@/mock/buy/BuyStepShell'
import type { BuyPageViewProps } from '@/mock/buy/types'

/** Buy product content (step 0) — shell chrome lives in `AppShell`. */
export function BuyPageView({ poweredBy, ...panelProps }: BuyPageViewProps) {
  return (
    <BuyStepShell poweredBy={poweredBy}>
      <BuyPanel {...panelProps} />
    </BuyStepShell>
  )
}

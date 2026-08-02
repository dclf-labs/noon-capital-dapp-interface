import { UnstakeProvider } from '@/features/unstake'
import { EvmUnstakeFlow } from '@/pages/stake-unstake/EvmUnstakeFlow'

export function UnstakePage() {
  return (
    <UnstakeProvider>
      <EvmUnstakeFlow />
    </UnstakeProvider>
  )
}

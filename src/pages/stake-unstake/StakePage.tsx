import { StakeProvider } from '@/features/stake'
import { EvmStakeFlow } from '@/pages/stake-unstake/EvmStakeFlow'

export function StakePage() {
  return (
    <StakeProvider>
      <EvmStakeFlow />
    </StakeProvider>
  )
}

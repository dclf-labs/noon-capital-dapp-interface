import { MintProvider } from '@/features/mint'
import { EvmMintFlow } from '@/pages/mint-redeem/EvmMintFlow'

export function MintPage() {
  return (
    <MintProvider>
      <EvmMintFlow />
    </MintProvider>
  )
}

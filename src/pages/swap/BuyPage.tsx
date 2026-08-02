import { EvmBuyProvider, StarknetBuyProvider } from '@/features/buy'
import { useResolvedChain } from '@/hooks/connection'
import * as styles from '@/mock/swap/trade-styles'
import { EvmBuyTrade } from '@/pages/swap/EvmBuyTrade'
import { StarknetBuyTrade } from '@/pages/swap/StarknetBuyTrade'

export function BuyPage() {
  const { chainFamily } = useResolvedChain()

  if (chainFamily === 'evm') {
    return (
      <EvmBuyProvider>
        <EvmBuyTrade />
      </EvmBuyProvider>
    )
  }

  if (chainFamily === 'starknet') {
    return (
      <StarknetBuyProvider>
        <StarknetBuyTrade />
      </StarknetBuyProvider>
    )
  }

  return (
    <p style={styles.muted}>
      Buy is available on EVM and Starknet. Switch the active network above.
    </p>
  )
}

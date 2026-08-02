import { EvmBuyProvider, StarknetBuyProvider } from '@/features/buy'
import { useResolvedChain } from '@/hooks/connection'
import { EvmBuyTrade } from '@/pages/swap/EvmBuyTrade'
import { StarknetBuyTrade } from '@/pages/swap/StarknetBuyTrade'
import * as styles from '@/pages/swap/trade-styles'

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

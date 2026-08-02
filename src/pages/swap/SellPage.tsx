import { EvmSellProvider, StarknetSellProvider } from '@/features/sell'
import { useResolvedChain } from '@/hooks/connection'
import { EvmSellTrade } from '@/pages/swap/EvmSellTrade'
import { StarknetSellTrade } from '@/pages/swap/StarknetSellTrade'
import * as styles from '@/pages/swap/trade-styles'

export function SellPage() {
  const { chainFamily } = useResolvedChain()

  if (chainFamily === 'evm') {
    return (
      <EvmSellProvider>
        <EvmSellTrade />
      </EvmSellProvider>
    )
  }

  if (chainFamily === 'starknet') {
    return (
      <StarknetSellProvider>
        <StarknetSellTrade />
      </StarknetSellProvider>
    )
  }

  return (
    <p style={styles.muted}>
      Sell is available on EVM and Starknet. Switch the active network above.
    </p>
  )
}

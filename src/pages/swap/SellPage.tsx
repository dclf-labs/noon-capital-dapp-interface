import { EvmSellProvider, StarknetSellProvider } from '@/features/sell'
import { useResolvedChain } from '@/hooks/connection'
import * as styles from '@/mock/swap/trade-styles'
import { EvmSellTrade } from '@/pages/swap/EvmSellTrade'
import { StarknetSellTrade } from '@/pages/swap/StarknetSellTrade'

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

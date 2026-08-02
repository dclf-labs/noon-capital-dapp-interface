import { EvmBridgeProvider, StarknetBridgeProvider, SuiBridgeProvider } from '@/features/bridge'
import { useResolvedChain } from '@/hooks/connection'
import * as styles from '@/pages/bridge/bridge-styles'
import { EvmBridgeFlow } from '@/pages/bridge/EvmBridgeFlow'
import { StarknetBridgeFlow } from '@/pages/bridge/StarknetBridgeFlow'
import { SuiBridgeFlow } from '@/pages/bridge/SuiBridgeFlow'

export function BridgePage() {
  const { chainFamily } = useResolvedChain()

  if (chainFamily === 'evm') {
    return (
      <EvmBridgeProvider>
        <EvmBridgeFlow />
      </EvmBridgeProvider>
    )
  }

  if (chainFamily === 'starknet') {
    return (
      <StarknetBridgeProvider>
        <StarknetBridgeFlow />
      </StarknetBridgeProvider>
    )
  }

  if (chainFamily === 'sui') {
    return (
      <SuiBridgeProvider>
        <SuiBridgeFlow />
      </SuiBridgeProvider>
    )
  }

  return (
    <p style={styles.muted}>
      Bridge is available on EVM, Starknet, and Sui. Switch the active network above.
    </p>
  )
}

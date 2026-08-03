import { useAccount, useDisconnect } from '@starknet-react/core'

import useStarknetWalletSelector from '@/features/shell/hooks/useStarknetWalletSelector'

/**
 * Starknet account helpers. `connect` opens the branded wallet selector
 * (same pattern as Sui → Mysten modal / EVM → AppKit).
 */
export function useStarknetWallet() {
  const { address, status } = useAccount()
  const { disconnect } = useDisconnect()
  const selector = useStarknetWalletSelector()

  return {
    address,
    status,
    isConnected: status === 'connected' && Boolean(address),
    connect: async () => {
      selector.onOpen()
    },
    disconnect,
  }
}

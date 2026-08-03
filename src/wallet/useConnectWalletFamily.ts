import type { ChainFamily } from '@/chains'
import useStarknetWalletSelector from '@/features/shell/hooks/useStarknetWalletSelector'
import useSuiWalletSelector from '@/features/shell/hooks/useSuiWalletSelector'
import { openEvmAppKit } from '@/wallet/evm/open-appkit'

/**
 * Opens the wallet connection UI for a given chain family.
 * EVM → AppKit, Starknet → branded selector, Sui → Mysten connect modal.
 */
export function useConnectWalletFamily() {
  const starknetSelector = useStarknetWalletSelector()
  const suiSelector = useSuiWalletSelector()

  return async function connectWalletFamily(family: ChainFamily) {
    switch (family) {
      case 'evm':
        await openEvmAppKit()
        return
      case 'starknet':
        starknetSelector.onOpen()
        return
      case 'sui':
        suiSelector.onOpen()
        return
    }
  }
}

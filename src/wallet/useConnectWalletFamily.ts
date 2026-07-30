import type { ChainFamily } from '@/chains'
import { useSuiWalletSelector } from '@/features/shell'
import { openEvmAppKit } from '@/wallet/evm/open-appkit'
import { useStarknetWallet } from '@/wallet/starknet/useStarknetWallet'

/**
 * Opens the wallet connection UI for a given chain family.
 * EVM → AppKit, Starknet → starknetkit, Sui → Mysten connect modal.
 */
export function useConnectWalletFamily() {
  const starknet = useStarknetWallet()
  const suiSelector = useSuiWalletSelector()

  return async function connectWalletFamily(family: ChainFamily) {
    switch (family) {
      case 'evm':
        await openEvmAppKit()
        return
      case 'starknet':
        await starknet.connect()
        return
      case 'sui':
        suiSelector.onOpen()
        return
    }
  }
}

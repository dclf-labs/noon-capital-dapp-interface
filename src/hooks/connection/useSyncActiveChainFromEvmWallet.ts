import { useEffect, useRef } from 'react'

import { useAccount as useEvmAccount } from 'wagmi'

import { asChainId, type ChainId } from '@/lib/chain'
import { nextActiveChainFromEvmWalletChange } from '@/lib/wallet-session'
import { useActiveChainStore } from '@/state/active-chain'
import { wagmiAdapter } from '@/wallet/evm/config'

/**
 * Keep the dapp active network aligned with the EVM wallet while in EVM mode.
 *
 * - On connect / wallet network change → update dapp to the wallet chain
 * - While dapp is on Starknet / Sui → leave selection alone
 * - Does not overwrite a dapp-initiated EVM pick while switchChain is pending
 *   (only reacts to wallet chain changes)
 */
export function useSyncActiveChainFromEvmWallet() {
  const selectedChainId = useActiveChainStore((s) => s.selectedChainId)
  const setSelectedChainId = useActiveChainStore((s) => s.setSelectedChainId)
  const { chainId, isConnected } = useEvmAccount({ config: wagmiAdapter.wagmiConfig })
  const previousWalletChainId = useRef<ChainId | undefined>(undefined)

  useEffect(() => {
    const { nextSelected, nextPrevious } = nextActiveChainFromEvmWalletChange({
      selectedChainId,
      walletChainId: asChainId(chainId),
      previousWalletChainId: previousWalletChainId.current,
      isEvmConnected: Boolean(isConnected),
    })

    previousWalletChainId.current = nextPrevious

    if (nextSelected !== null) {
      setSelectedChainId(nextSelected)
    }
  }, [chainId, isConnected, selectedChainId, setSelectedChainId])
}

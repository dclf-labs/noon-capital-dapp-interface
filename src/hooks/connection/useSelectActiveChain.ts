import { useCallback } from 'react'

import { useAccount as useEvmAccount, useSwitchChain } from 'wagmi'

import { type ChainId, isEvmChainId, isValidChainId } from '@/lib/chain'
import { useActiveChainStore } from '@/state/active-chain'
import { wagmiAdapter } from '@/wallet/evm/config'

/**
 * Select the dapp product network (retained across pages).
 * For EVM chains with a connected wallet, also requests a matching wallet switch.
 */
export function useSelectActiveChain() {
  const selectedChainId = useActiveChainStore((s) => s.selectedChainId)
  const setSelectedChainId = useActiveChainStore((s) => s.setSelectedChainId)
  const { isConnected } = useEvmAccount({ config: wagmiAdapter.wagmiConfig })
  const { switchChainAsync, isPending } = useSwitchChain({ config: wagmiAdapter.wagmiConfig })

  const selectActiveChain = useCallback(
    async (chainId: ChainId) => {
      if (!isValidChainId(chainId)) return

      // Update dapp first so all pages see a consistent selection immediately.
      setSelectedChainId(chainId)

      if (!isEvmChainId(chainId) || !isConnected) return

      try {
        await switchChainAsync({ chainId: Number(chainId) })
      } catch (error) {
        // User may reject the wallet prompt; dapp selection still sticks.
        console.warn('[wallet] EVM switchChain rejected or failed', error)
      }
    },
    [isConnected, setSelectedChainId, switchChainAsync],
  )

  return {
    selectedChainId,
    selectActiveChain,
    isSwitchingEvmNetwork: isPending,
  }
}

import { useCurrentAccount, useCurrentNetwork } from '@mysten/dapp-kit-react'
import {
  useAccount as useStarknetAccount,
  useNetwork as useStarknetNetwork,
} from '@starknet-react/core'
import { useAccount as useEvmAccount } from 'wagmi'

import type { ChainFamily, ChainKey } from '@/chains'
import { getChainReader } from '@/wallet/readers'
import type { MultiChainClient, WalletSession } from '@/wallet/types'

/**
 * Bridge-ready multi-chain facade.
 * Each family exposes its own session; readers work for any chain key.
 */
export function useMultiChainClient(): MultiChainClient {
  const evm = useEvmAccount()
  const starknet = useStarknetAccount()
  const starknetNetwork = useStarknetNetwork()
  const suiAccount = useCurrentAccount()
  const suiNetwork = useCurrentNetwork()

  const sessions: Record<ChainFamily, WalletSession> = {
    evm: {
      family: 'evm',
      address: evm.address,
      isConnected: Boolean(evm.address),
      networkLabel: evm.chainId ? `eip155:${evm.chainId}` : undefined,
    },
    starknet: {
      family: 'starknet',
      address: starknet.address,
      isConnected: Boolean(starknet.address),
      networkLabel: starknetNetwork.chain?.name ?? starknetNetwork.chain?.id?.toString(),
    },
    sui: {
      family: 'sui',
      address: suiAccount?.address,
      isConnected: Boolean(suiAccount?.address),
      networkLabel: String(suiNetwork),
    },
  }

  return {
    getWalletSession(family) {
      return sessions[family]
    },
    getReader(chainKey: ChainKey) {
      return getChainReader(chainKey)
    },
    listConnectedAddresses() {
      const result: Partial<Record<ChainFamily, string>> = {}
      for (const family of Object.keys(sessions) as ChainFamily[]) {
        const address = sessions[family].address
        if (address) result[family] = address
      }
      return result
    },
  }
}

import { useCurrentAccount, useCurrentNetwork, useWalletConnection } from '@mysten/dapp-kit-react'
import {
  useAccount as useStarknetAccount,
  useNetwork as useStarknetNetwork,
} from '@starknet-react/core'
import { useAccount as useEvmAccount } from 'wagmi'

import type { ChainFamily, ChainKey } from '@/chains'
import { isAddressValid } from '@/lib/address'
import { wagmiAdapter } from '@/wallet/evm/config'
import { getChainReader } from '@/wallet/readers'
import type { FamilyWalletStatus, MultiChainClient } from '@/wallet/types'

/**
 * Bridge-ready multi-chain facade.
 * Each family exposes its own session; readers work for any chain key.
 * `isConnected` requires SDK connected status + a valid address (aligned with useWalletSession).
 */
export function useMultiChainClient(): MultiChainClient {
  const evm = useEvmAccount({ config: wagmiAdapter.wagmiConfig })
  const starknet = useStarknetAccount()
  const starknetNetwork = useStarknetNetwork()
  const suiAccount = useCurrentAccount()
  const suiNetwork = useCurrentNetwork()
  const { status: suiStatus, isConnected: suiSdkConnected } = useWalletConnection()

  const sessions: Record<ChainFamily, FamilyWalletStatus> = {
    evm: {
      family: 'evm',
      address: evm.isConnected && isAddressValid(evm.address) ? evm.address : undefined,
      isConnected: Boolean(evm.isConnected && isAddressValid(evm.address)),
      networkLabel: evm.chainId ? `eip155:${evm.chainId}` : undefined,
    },
    starknet: {
      family: 'starknet',
      address:
        starknet.isConnected && isAddressValid(starknet.address) ? starknet.address : undefined,
      isConnected: Boolean(starknet.isConnected && isAddressValid(starknet.address)),
      networkLabel: starknetNetwork.chain?.name ?? starknetNetwork.chain?.id?.toString(),
    },
    sui: {
      family: 'sui',
      address:
        suiSdkConnected &&
        suiStatus === 'connected' &&
        suiAccount?.address &&
        isAddressValid(suiAccount.address)
          ? suiAccount.address
          : undefined,
      isConnected: Boolean(
        suiSdkConnected &&
        suiStatus === 'connected' &&
        suiAccount?.address &&
        isAddressValid(suiAccount.address),
      ),
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
        const session = sessions[family]
        if (session.isConnected && session.address) result[family] = session.address
      }
      return result
    },
  }
}

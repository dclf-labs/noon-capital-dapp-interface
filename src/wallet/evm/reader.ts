import { JsonRpcProvider } from 'ethers'
import { createPublicClient, http, type PublicClient } from 'viem'

import { chains, type EvmChainKey, evmChains, getEvmAppKitNetwork } from '@/chains'

const publicClients = new Map<EvmChainKey, PublicClient>()
const ethersProviders = new Map<EvmChainKey, JsonRpcProvider>()

export function getEvmPublicClient(chainKey: EvmChainKey): PublicClient {
  const cached = publicClients.get(chainKey)
  if (cached) return cached

  const network = getEvmAppKitNetwork(chainKey)
  const definition = chains[chainKey]
  const client = createPublicClient({
    chain: network,
    transport: http(definition.rpcUrls[0]),
  })

  publicClients.set(chainKey, client as PublicClient)
  return client as PublicClient
}

/** ethers.js read provider — independent of the connected wallet. */
export function getEthersJsonRpcProvider(chainKey: EvmChainKey): JsonRpcProvider {
  const cached = ethersProviders.get(chainKey)
  if (cached) return cached

  const definition = chains[chainKey]
  const provider = new JsonRpcProvider(definition.rpcUrls[0], definition.chainId)
  ethersProviders.set(chainKey, provider)
  return provider
}

export async function getEvmNativeBalance(
  chainKey: EvmChainKey,
  address: `0x${string}`,
): Promise<bigint> {
  return getEvmPublicClient(chainKey).getBalance({ address })
}

export function listEvmPublicClients(): Record<EvmChainKey, PublicClient> {
  return Object.fromEntries(
    evmChains.map((chain) => [chain.key, getEvmPublicClient(chain.key)]),
  ) as Record<EvmChainKey, PublicClient>
}

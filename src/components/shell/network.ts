import { type ChainKey, chainList, isEvmChain } from '@/chains'
import { type ChainId, getChainConfig, getStarknetChainId, getSuiChainId } from '@/lib/chain'

/** Protocol / product chain id for a registry chain key. */
export function protocolIdForChainKey(key: ChainKey): ChainId {
  if (key === 'starknet') return getStarknetChainId()!
  if (key === 'sui') return getSuiChainId()!
  const chain = chainList.find((entry) => entry.key === key)
  if (chain && isEvmChain(chain)) return chain.chainId
  throw new Error(`Unknown chain key: ${key}`)
}

/** Public asset path for a chain icon (`iconSlug` from protocol config). */
export function chainIconSrc(chainId: ChainId | null | undefined): string {
  const slug = getChainConfig(chainId).iconSlug
  return `/assets/chains/${slug}.svg`
}

export type NetworkOption = {
  key: ChainKey
  name: string
  chainId: ChainId
  iconSrc: string
}

/** Header network picker — active product networks only. */
export const HEADER_NETWORK_KEYS = [
  'ethereum',
  'zksync',
  'sophon',
  'tac',
  'starknet',
] as const satisfies readonly ChainKey[]

/** Active header networks with icon + protocol id. */
export function getNetworkOptions(): NetworkOption[] {
  return HEADER_NETWORK_KEYS.map((key) => {
    const chain = chainList.find((entry) => entry.key === key)
    if (!chain) throw new Error(`Missing chain definition: ${key}`)
    const chainId = protocolIdForChainKey(key)
    return {
      key,
      name: chain.name,
      chainId,
      iconSrc: chainIconSrc(chainId),
    }
  })
}

/** Static header network list — safe to reuse across renders. */
export const NETWORK_OPTIONS = getNetworkOptions()

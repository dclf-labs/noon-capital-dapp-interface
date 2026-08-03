import { activeProtocolConfigs } from '@/config/chains'
import { isBridgePairAllowed } from '@/features/bridge/route'
import type { ChainId } from '@/lib/chain'
import type { BridgeNetworkOption } from '@/mock/bridge/types'

/**
 * Stable product order for bridge network pickers (header-adjacent first, then the rest).
 * Every active protocol chain with bridge support should appear here.
 */
const BRIDGE_NETWORK_ORDER = [
  'ethereum',
  'zksync',
  'sophon',
  'tac',
  'starknet',
  'sui',
  'base',
  'hyperevm',
  'citrea',
  'berachain',
] as const

function orderIndex(iconSlug: string | undefined): number {
  const idx = BRIDGE_NETWORK_ORDER.indexOf(
    (iconSlug ?? '') as (typeof BRIDGE_NETWORK_ORDER)[number],
  )
  return idx === -1 ? BRIDGE_NETWORK_ORDER.length : idx
}

/**
 * All active bridgeable networks (EVM + Starknet + Sui) from `activeProtocolConfigs`.
 * Never filters by route — callers mark unavailable options with `disabled`.
 */
export function getAllBridgeNetworks(): BridgeNetworkOption[] {
  return Object.values(activeProtocolConfigs)
    .filter((config): config is NonNullable<typeof config> => Boolean(config?.bridgeTokens?.length))
    .map((config) => ({
      id: Number(config.id),
      name: config.name,
      disabled: false,
    }))
    .sort((a, b) => {
      const configA = activeProtocolConfigs[a.id as ChainId]
      const configB = activeProtocolConfigs[b.id as ChainId]
      return orderIndex(configA?.iconSlug) - orderIndex(configB?.iconSlug)
    })
}

/**
 * Source networks — always the full list.
 * When a destination is selected, incompatible sources are marked `disabled`.
 */
export function getBridgeSourceNetworks(destinationChainId?: ChainId): BridgeNetworkOption[] {
  return getAllBridgeNetworks().map((network) => ({
    ...network,
    disabled:
      destinationChainId != null ? !isBridgePairAllowed(network.id, destinationChainId) : false,
  }))
}

/**
 * Destination networks — always the full list.
 * When a source is selected, incompatible destinations are marked `disabled`.
 */
export function getBridgeDestinationNetworks(sourceChainId?: ChainId): BridgeNetworkOption[] {
  return getAllBridgeNetworks().map((network) => ({
    ...network,
    disabled: sourceChainId != null ? !isBridgePairAllowed(sourceChainId, network.id) : false,
  }))
}

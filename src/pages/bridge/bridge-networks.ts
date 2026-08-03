import starknetConfig from '@/config/chains/starknet'
import suiConfig from '@/config/chains/sui'
import { isBridgePairAllowed } from '@/features/bridge/route'
import {
  type ChainId,
  getActiveEvmChainIds,
  getChainConfig,
  getStarknetChainId,
  getSuiChainId,
} from '@/lib/chain'
import type { BridgeNetworkOption } from '@/mock/bridge/types'

/** All bridgeable networks (EVM + Starknet + Sui) — matches old-dapp `activeConfig` lists. */
export function getAllBridgeNetworks(): BridgeNetworkOption[] {
  const networks: BridgeNetworkOption[] = getActiveEvmChainIds().map((id) => {
    const config = getChainConfig(id)
    return { id: Number(id), name: config.name }
  })

  const starknetId = getStarknetChainId()
  const suiId = getSuiChainId()
  if (starknetId != null) {
    networks.push({ id: Number(starknetId), name: starknetConfig.name })
  }
  if (suiId != null) {
    networks.push({ id: Number(suiId), name: suiConfig.name })
  }

  return networks
}

/**
 * Source networks for the bridge card.
 * Always includes every bridgeable family so picking Starknet/Sui switches the active chain
 * (same as old-dapp BridgeSourceNetworkSelector).
 */
export function getBridgeSourceNetworks(
  _family?: 'evm' | 'starknet' | 'sui',
): BridgeNetworkOption[] {
  return getAllBridgeNetworks()
}

/**
 * Destination candidates, filtered by {@link isBridgePairAllowed} once a source is selected.
 * Includes EVM + Starknet + Sui (old-dapp destination selector).
 */
export function getBridgeDestinationNetworks(
  sourceChainId: ChainId | undefined,
  _family?: 'evm' | 'starknet' | 'sui',
): BridgeNetworkOption[] {
  const candidates = getAllBridgeNetworks()
  if (sourceChainId == null) return candidates
  return candidates.filter((network) => isBridgePairAllowed(sourceChainId, network.id))
}

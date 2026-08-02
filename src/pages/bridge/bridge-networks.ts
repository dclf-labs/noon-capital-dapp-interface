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
import type { BridgeNetworkOption } from '@/mock/bridge/BridgePanel'

/** Source networks available for the connected wallet family. */
export function getBridgeSourceNetworks(family: 'evm' | 'starknet' | 'sui'): BridgeNetworkOption[] {
  if (family === 'starknet') {
    return [{ id: Number(starknetConfig.id), name: starknetConfig.name }]
  }
  if (family === 'sui') {
    return [{ id: Number(suiConfig.id), name: suiConfig.name }]
  }
  return getActiveEvmChainIds().map((id) => {
    const config = getChainConfig(id)
    return { id: Number(id), name: config.name }
  })
}

/**
 * Destination candidates for the active family, filtered by {@link isBridgePairAllowed}
 * once a source is selected.
 */
export function getBridgeDestinationNetworks(
  sourceChainId: ChainId | undefined,
  family: 'evm' | 'starknet' | 'sui',
): BridgeNetworkOption[] {
  const candidates: BridgeNetworkOption[] = [
    ...getActiveEvmChainIds().map((id) => {
      const config = getChainConfig(id)
      return { id: Number(id), name: config.name }
    }),
  ]

  const starknetId = getStarknetChainId()
  const suiId = getSuiChainId()
  if (starknetId != null && family !== 'starknet') {
    candidates.push({ id: Number(starknetId), name: starknetConfig.name })
  }
  if (suiId != null && family !== 'sui') {
    candidates.push({ id: Number(suiId), name: suiConfig.name })
  }

  if (sourceChainId == null) return candidates
  return candidates.filter((network) => isBridgePairAllowed(sourceChainId, network.id))
}

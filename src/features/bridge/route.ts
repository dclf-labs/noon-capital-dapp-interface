import type { ChainId } from '@/config/chain-id'
import type { Token } from '@/config/token'
import {
  IS_LAYERZERO_BRIDGE_DISABLED,
  IS_SUI_TO_ETH_BRIDGE_DISABLED,
  STARKNET_BRIDGE_DESTINATION,
} from '@/constants/common'
import type { Address } from '@/lib/address'
import {
  isBaseEthereumIncompatiblePair,
  isBerachainEthereumIncompatiblePair,
  isCitreaEthereumIncompatiblePair,
  isHyperEvmStarknetIncompatiblePair,
  isSuiChain,
  isSuiEthereumIncompatiblePair,
  isTacStarknetIncompatiblePair,
} from '@/lib/chain'
import { toNum } from '@/lib/format'

/**
 * Whether the route should use Hyperlane (vs LayerZero).
 * Missing destination defaults to Hyperlane so approval/fee hooks stay inert
 * until a concrete dest is chosen (avoids premature LZ approve UX).
 */
export function isHyperlaneBridgeRoute(
  sourceUseHyperlane: Partial<Record<number, boolean>> | undefined,
  destinationChainId: ChainId | null | undefined,
): boolean {
  if (destinationChainId == null) return true
  if (Number(destinationChainId) === Number(STARKNET_BRIDGE_DESTINATION?.id)) return true
  return !!sourceUseHyperlane?.[toNum(destinationChainId)]
}

/** Product pair hard-blocks (same chain, TAC/HyperEVM/Base/Citrea/Bera/Sui rules). */
export function isBridgePairAllowed(
  sourceChainId: ChainId | null | undefined,
  destinationChainId: ChainId | null | undefined,
): boolean {
  if (sourceChainId == null || destinationChainId == null) return false
  if (Number(sourceChainId) === Number(destinationChainId)) return false
  if (isTacStarknetIncompatiblePair(sourceChainId, destinationChainId)) return false
  if (isHyperEvmStarknetIncompatiblePair(sourceChainId, destinationChainId)) return false
  if (isBaseEthereumIncompatiblePair(sourceChainId, destinationChainId)) return false
  if (isBaseEthereumIncompatiblePair(destinationChainId, sourceChainId)) return false
  if (isCitreaEthereumIncompatiblePair(sourceChainId, destinationChainId)) return false
  if (isCitreaEthereumIncompatiblePair(destinationChainId, sourceChainId)) return false
  if (isBerachainEthereumIncompatiblePair(sourceChainId, destinationChainId)) return false
  if (isBerachainEthereumIncompatiblePair(destinationChainId, sourceChainId)) return false
  if (isSuiEthereumIncompatiblePair(sourceChainId, destinationChainId)) return false
  return true
}

/** LZ global kill (Hyperlane routes stay available). */
export function isLayerzeroBridgeRouteDisabled(isHyperlaneRoute: boolean): boolean {
  return IS_LAYERZERO_BRIDGE_DISABLED && !isHyperlaneRoute
}

/** Sui → Ethereum kill switch. */
export function isSuiToEthBridgeDisabled(
  sourceChainId: ChainId | null | undefined,
  destinationChainId: ChainId | null | undefined,
): boolean {
  if (!IS_SUI_TO_ETH_BRIDGE_DISABLED) return false
  return isSuiChain(sourceChainId) && !isSuiChain(destinationChainId)
}

/** LayerZero approve spender: helper if set, else OFT token address. */
export function getLayerzeroApproveSpender(
  token: Token | undefined,
  layerzeroOftHelper?: Address,
): Address | undefined {
  return (layerzeroOftHelper || token?.layerzeroOftAddress) as Address | undefined
}

/**
 * Whether LZ needs an ERC-20 approve before send.
 * Always when a helper is configured; otherwise only when OFT ≠ underlying token.
 */
export function doesLayerzeroNeedApproval(
  token: Token | undefined,
  layerzeroOftHelper?: Address,
): boolean {
  if (layerzeroOftHelper) return true
  if (!token?.contractAddress || !token.layerzeroOftAddress) return true
  return token.layerzeroOftAddress.toLowerCase() !== token.contractAddress.toLowerCase()
}

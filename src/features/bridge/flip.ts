import { isBridgePairAllowed } from '@/features/bridge/route'
import type { ChainId } from '@/lib/chain'
import { getChainFamily } from '@/lib/wallet-session'
import { useBridgeFlipStore } from '@/state/bridge-flip'

/** Whether flipping source↔destination yields a structurally allowed reverse route. */
export function canFlipBridgeNetworks(
  sourceChainId: ChainId | null | undefined,
  destinationChainId: ChainId | null | undefined,
): boolean {
  if (sourceChainId == null || destinationChainId == null) return false
  // Kill switches (e.g. Sui→ETH maintenance) disable submit, not the flip control.
  return isBridgePairAllowed(destinationChainId, sourceChainId)
}

/** True when flip stays inside the EVM bridge provider (no family switch). */
export function isSameFamilyBridgeFlip(
  sourceChainId: ChainId | null | undefined,
  destinationChainId: ChainId | null | undefined,
): boolean {
  if (sourceChainId == null || destinationChainId == null) return false
  return getChainFamily(sourceChainId) === getChainFamily(destinationChainId)
}

type FlipHandlers = {
  selectActiveChain: (chainId: ChainId) => void | Promise<void>
  /** Same-family in-provider swap (EVM↔EVM). */
  applySameFamilyFlip?: (nextSource: ChainId, nextDestination: ChainId) => void
}

/**
 * Flip source↔destination for any allowed pair.
 * Same-family EVM flips update inputs in place; cross-family flips stash the
 * reversed pair and switch the product network so the target provider applies it.
 */
export function requestBridgeNetworkFlip(
  sourceChainId: ChainId | null | undefined,
  destinationChainId: ChainId | null | undefined,
  handlers: FlipHandlers,
): boolean {
  if (
    !canFlipBridgeNetworks(sourceChainId, destinationChainId) ||
    sourceChainId == null ||
    destinationChainId == null
  ) {
    return false
  }

  const nextSource = destinationChainId
  const nextDestination = sourceChainId

  if (isSameFamilyBridgeFlip(sourceChainId, destinationChainId)) {
    handlers.applySameFamilyFlip?.(nextSource, nextDestination)
    void handlers.selectActiveChain(nextSource)
    return true
  }

  useBridgeFlipStore.getState().setPending({
    sourceChainId: nextSource,
    destinationChainId: nextDestination,
  })
  void handlers.selectActiveChain(nextSource)
  return true
}

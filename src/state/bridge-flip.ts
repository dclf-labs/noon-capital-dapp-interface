import { create } from 'zustand'

import type { ChainId } from '@/lib/chain'

export type PendingBridgeFlip = {
  /** New source after flip (current destination). */
  sourceChainId: ChainId
  /** New destination after flip (current source). */
  destinationChainId: ChainId
}

type BridgeFlipStore = {
  pending: PendingBridgeFlip | null
  setPending: (pending: PendingBridgeFlip | null) => void
  /** Read + clear pending flip in one step (for BridgeProvider apply-on-family-change). */
  consumePending: () => PendingBridgeFlip | null
}

/**
 * Cross-family bridge flip handoff.
 * Same-family EVM flips stay in-provider; when source/dest families differ we
 * stash the reversed pair here, switch the product network, then the target
 * BridgeProvider applies it instead of wiping destination.
 */
export const useBridgeFlipStore = create<BridgeFlipStore>((set, get) => ({
  pending: null,
  setPending: (pending) => set({ pending }),
  consumePending: () => {
    const pending = get().pending
    if (pending) set({ pending: null })
    return pending
  },
}))
